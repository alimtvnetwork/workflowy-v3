# 02 — ChunkOverlap Validation Tests (AB-9303)

> **Parent:** [00-overview.md](./00-overview.md)

---

## Test Suite: ChunkOverlap

```go
func TestChunkOverlapValidation(t *testing.T) {
    v := &rag.DefaultValidator{}
    
    tests := []struct {
        name         string
        overlap      int
        chunkSize    int
        expectError  bool
        expectedCode int
        description  string
    }{
        // Valid cases
        {
            name:        "ValidZero",
            overlap:     0,
            chunkSize:   2048,
            expectError: false,
            description: "Zero overlap is valid",
        },
        {
            name:        "ValidDefault100",
            overlap:     100,
            chunkSize:   2048,
            expectError: false,
            description: "Default 100 overlap with 2048 chunk",
        },
        {
            name:        "Valid25Percent",
            overlap:     512,
            chunkSize:   2048,
            expectError: false,
            description: "Exactly 25% of chunk size",
        },
        {
            name:        "Valid10Percent",
            overlap:     204,
            chunkSize:   2048,
            expectError: false,
            description: "10% of chunk size",
        },
        {
            name:        "ValidMaxAbsolute",
            overlap:     512,
            chunkSize:   8192,
            expectError: false,
            description: "Maximum absolute overlap",
        },
        {
            name:        "ValidSmallChunk",
            overlap:     64,
            chunkSize:   256,
            expectError: false,
            description: "25% of minimum chunk size",
        },
        
        // Invalid absolute range cases
        {
            name:         "NegativeOverlap",
            overlap:      -1,
            chunkSize:    2048,
            expectError:  true,
            expectedCode: 9303,
            description:  "Negative overlap invalid",
        },
        {
            name:         "ExceedsAbsoluteMax",
            overlap:      513,
            chunkSize:    8192,
            expectError:  true,
            expectedCode: 9303,
            description:  "Just above 512 absolute max",
        },
        
        // Invalid percentage cases (>25%)
        {
            name:         "Exceeds25Percent2048",
            overlap:      600,
            chunkSize:    2048,
            expectError:  true,
            expectedCode: 9303,
            description:  "600 > 512 (25% of 2048)",
        },
        {
            name:         "Exceeds25Percent1024",
            overlap:      300,
            chunkSize:    1024,
            expectError:  true,
            expectedCode: 9303,
            description:  "300 > 256 (25% of 1024)",
        },
        {
            name:         "Exceeds25Percent512",
            overlap:      150,
            chunkSize:    512,
            expectError:  true,
            expectedCode: 9303,
            description:  "150 > 128 (25% of 512)",
        },
        {
            name:         "Exceeds25Percent256",
            overlap:      100,
            chunkSize:    256,
            expectError:  true,
            expectedCode: 9303,
            description:  "100 > 64 (25% of 256)",
        },
        {
            name:         "HalfChunkSize",
            overlap:      1024,
            chunkSize:    2048,
            expectError:  true,
            expectedCode: 9303,
            description:  "50% overlap is invalid",
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := v.ValidateChunkOverlap(tt.overlap, tt.chunkSize)
            
            if tt.expectError {
                require.NotNil(t, err, "expected error for %s", tt.description)
                assert.Equal(t, tt.expectedCode, err.Code)
                assert.Equal(t, "ChunkOverlap", err.Field)
            } else {
                assert.Nil(t, err, "expected no error for %s", tt.description)
            }
        })
    }
}

func TestChunkOverlapPercentageEdgeCases(t *testing.T) {
    v := &rag.DefaultValidator{}
    
    // Test exact 25% boundaries for various chunk sizes
    testCases := []struct {
        chunkSize  int
        maxOverlap int
    }{
        {256, 64},
        {512, 128},
        {1024, 256},
        {2048, 512},
        {4096, 512}, // Capped at 512 max
        {8192, 512}, // Capped at 512 max
    }
    
    for _, tc := range testCases {
        t.Run(fmt.Sprintf("chunk_%d", tc.chunkSize), func(t *testing.T) {
            // Exact boundary should pass
            err := v.ValidateChunkOverlap(tc.maxOverlap, tc.chunkSize)
            assert.Nil(t, err, "exact 25%% boundary should pass for chunk %d", tc.chunkSize)
            
            // One above should fail (unless at absolute max)
            if tc.maxOverlap < 512 {
                err = v.ValidateChunkOverlap(tc.maxOverlap+1, tc.chunkSize)
                assert.NotNil(t, err, "just above 25%% should fail for chunk %d", tc.chunkSize)
            }
        })
    }
}
```
