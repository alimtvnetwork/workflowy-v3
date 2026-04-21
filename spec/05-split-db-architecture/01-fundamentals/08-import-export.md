# Import / Export (Zip Files)

> **Updated:** 2026-04-19

---

## Export Project to Zip

```go
// ExportProjectToZip creates a zip file of all project databases
func (m *DbManager) ExportProjectToZip(projectSlug, outputPath string) error {
    m.logger.Info("Starting export", "project", projectSlug, "output", outputPath)
    
    projectDir := filepath.Join(m.dataDir, projectSlug)
    if pathutil.IsDirMissing(projectDir) {
        return apperror.New(
            ErrProjectNotFound,
            "project not found",
        ).WithContext("project", projectSlug)
    }
    
    // Create zip file
    zipFile, err := pathutil.Create(outputPath)
    if err != nil {
        return apperror.Wrap(
            err,
            ErrFsWrite,
            "create zip file",
        ).WithPath(outputPath)
    }
    defer zipFile.Close()
    
    zipWriter := zip.NewWriter(zipFile)
    defer zipWriter.Close()
    
    // Walk project directory and add all .db files
    err = filepath.Walk(projectDir, func(path string, info os.FileInfo, err error) error {
        if err != nil {
            m.logger.Warn("Skip file due to error", "path", path, "error", err)
            return nil // Continue walking
        }
        
        if info.IsDir() || stringutil.IsMissingSuffix(path, ".db") {
            return nil
        }
        
        // Get relative path within project
        relPath, _ := filepath.Rel(projectDir, path)
        
        m.logger.Debug("Adding to zip", "file", relPath, "size", info.Size())
        
        // Create zip entry
        writer, err := zipWriter.Create(relPath)
        if err != nil {
            return err
        }
        
        // Copy file content
        file, err := pathutil.Open(path)
        if err != nil {
            return err
        }
        defer file.Close()
        
        _, err = io.Copy(writer, file)
        return err
    })
    
    if err != nil {
        return apperror.Wrap(
            err,
            ErrExportFailed,
            "export project to zip",
        ).WithContext("project", projectSlug)
    }
    
    m.logger.Info("Export complete", "project", projectSlug, "output", outputPath)
    return nil
}
```

---

## Import Project from Zip

```go
// ImportProjectFromZip imports databases from a zip file
func (m *DbManager) ImportProjectFromZip(zipPath, projectSlug string, overwrite bool) error {
    m.logger.Info("Starting import", "zip", zipPath, "project", projectSlug, "overwrite", overwrite)
    
    // Open zip file
    reader, err := zip.OpenReader(zipPath)
    if err != nil {
        return apperror.Wrap(
            err,
            ErrFsRead,
            "open zip file",
        ).WithPath(zipPath)
    }
    defer reader.Close()
    
    projectDir := filepath.Join(m.dataDir, projectSlug)
    
    // Check if project exists
    isProjectExists := pathutil.IsDir(projectDir)
    isReadOnly := !overwrite
    isProjectConflict := isProjectExists && isReadOnly

    if isProjectConflict {
        return apperror.FailNew[ImportResult](
            errors.ErrFsConflict,
            "project already exists; use overwrite=true to replace",
        )
    }
    
    // Close any open databases for this project
    m.closeProjectDbs(projectSlug)
    
    // Create project directory
    if err := pathutil.EnsureDir(projectDir, 0755); err != nil {
        return err
    }
    
    // Extract files
    for _, file := range reader.File {
        if file.FileInfo().IsDir() {
            continue
        }
        
        destPath := filepath.Join(projectDir, file.Name)
        
        m.logger.Debug("Extracting", "file", file.Name, "size", file.UncompressedSize64)
        
        // Create directory structure
        if err := pathutil.EnsureDir(filepath.Dir(destPath), 0755); err != nil {
            return err
        }
        
        // Extract file
        if err := m.extractZipFile(file, destPath); err != nil {
            return apperror.Wrap(
                err,
                ErrImportFailed,
                "extract zip entry",
            ).WithContext("file", file.Name)
        }
    }
    
    // Register databases in root.db
    if err := m.registerImportedDatabases(projectSlug); err != nil {
        m.logger.Warn("Failed to register databases", "error", err)
    }
    
    m.logger.Info("Import complete", "project", projectSlug, "files", len(reader.File))
    return nil
}

func (m *DbManager) extractZipFile(file *zip.File, destPath string) error {
    src, err := file.Open()
    if err != nil {
        return err
    }
    defer src.Close()
    
    dst, err := pathutil.Create(destPath)
    if err != nil {
        return err
    }
    defer dst.Close()
    
    _, err = io.Copy(dst, src)
    return err
}
```

---

## Selective Export (By Type/Category)

```go
// ExportByType exports only specific database types
func (m *DbManager) ExportByType(projectSlug string, dbTypes []string, outputPath string) error {
    m.logger.Info("Selective export", "project", projectSlug, "types", dbTypes)
    
    // Filter databases by type
    dbs, err := m.ListDatabases(projectSlug)
    if err != nil {
        return err
    }
    
    typeSet := make(map[string]bool)
    for _, t := range dbTypes {
        typeSet[t] = true
    }
    
    // Create zip with only matching types
    zipFile, err := pathutil.Create(outputPath)
    if err != nil {
        return err
    }
    defer zipFile.Close()
    
    zipWriter := zip.NewWriter(zipFile)
    defer zipWriter.Close()
    
    for _, db := range dbs {
        if !typeSet[db.Type] {
            continue
        }
        
        m.logger.Debug("Including", "type", db.Type, "path", db.Path)
        
        fullPath := filepath.Join(m.dataDir, db.Path)
        relPath := strings.TrimPrefix(db.Path, projectSlug+"/")
        
        writer, _ := zipWriter.Create(relPath)
        file, _ := pathutil.Open(fullPath)
        io.Copy(writer, file)
        file.Close()
    }
    
    return nil
}
```

---

*Import / export — v3.2.0 — 2026-04-19*
