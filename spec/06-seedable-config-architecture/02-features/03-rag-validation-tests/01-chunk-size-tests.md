# 01 — ChunkSize Validation Tests (AB-9301, AB-9302)

> **Parent:** [00-overview.md](./00-overview.md)

---

## Test Suite: ChunkSize

```go
package rag_test

import (
    "testing"
    
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
    
    "aibridge/internal/rag"
)

func TestChunkSizeValidation(t *testing.T) {
    v := &rag.DefaultValidator{}
    
    tests := []struct {
        name         string
        size         int
        expectError  bool
        expectedCode int
        description  string
    }{
        // Valid cases
        {
            name:        "ValidMinimum",
            size:        256,
            expectError: false,
            description: "Minimum valid chunk size",
        },
        {
            name:        "ValidDefault",
            size:        2048,
            expectError: false,
            description: "Default chunk size",
        },
        {
            name:        "ValidMaximum",
            size:        8192,
            expectError: false,
            description: "Maximum valid chunk size",
        },
        {
            name:        "ValidMultiple512",
            size:        512,
            expectError: false,
            description: "Valid multiple of 256",
        },
        {
            name:        "ValidMultiple1024",
            size:        1024,
            expectError: false,
            description: "Valid multiple of 256",
        },
        {
            name:        "ValidMultiple4096",
            size:        4096,
            expectError: false,
            description: "Large valid chunk size",
        },
        
        // Invalid range cases (AB-9301)
        {
            name:         "TooSmallZero",
            size:         0,
            expectError:  true,
            expectedCode: 9301,
            description:  "Zero is below minimum",
        },
        {
            name:         "TooSmall100",
            size:         100,
            expectError:  true,
            expectedCode: 9301,
            description:  "100 is below minimum 256",
        },
        {
            name:         "TooSmall255",
            size:         255,
            expectError:  true,
            expectedCode: 9301,
            description:  "Just below minimum boundary",
        },
        {
            name:         "TooLarge8193",
            size:         8193,
            expectError:  true,
            expectedCode: 9301,
            description:  "Just above maximum boundary",
        },
        {
            name:         "TooLarge16384",
            size:         16384,
            expectError:  true,
            expectedCode: 9301,
            description:  "Far above maximum",
        },
        {
            name:         "NegativeValue",
            size:         -256,
            expectError:  true,
            expectedCode: 9301,
            description:  "Negative values invalid",
        },
        
        // Invalid multiple cases (AB-9302)
        {
            name:         "NotMultiple257",
            size:         257,
            expectError:  true,
            expectedCode: 9302,
            description:  "Just above valid minimum but not multiple",
        },
        {
            name:         "NotMultiple1000",
            size:         1000,
            expectError:  true,
            expectedCode: 9302,
            description:  "Round number but not multiple of 256",
        },
        {
            name:         "NotMultiple1500",
            size:         1500,
            expectError:  true,
            expectedCode: 9302,
            description:  "In range but not multiple",
        },
        {
            name:         "NotMultiple2000",
            size:         2000,
            expectError:  true,
            expectedCode: 9302,
            description:  "Close to 2048 but not multiple",
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := v.ValidateChunkSize(tt.size)
            
            if tt.expectError {
                require.NotNil(t, err, "expected error for %s", tt.description)
                assert.Equal(t, tt.expectedCode, err.Code, "wrong error code")
                assert.Equal(t, "ChunkSize", err.Field)
                assert.Equal(t, tt.size, err.Value)
            } else {
                assert.Nil(t, err, "expected no error for %s", tt.description)
            }
        })
    }
}

func TestChunkSizeBoundaryConditions(t *testing.T) {
    v := &rag.DefaultValidator{}
    
    // Test exact boundaries
    assert.Nil(t, v.ValidateChunkSize(256), "minimum boundary should pass")
    assert.Nil(t, v.ValidateChunkSize(8192), "maximum boundary should pass")
    
    // Test just outside boundaries
    assert.NotNil(t, v.ValidateChunkSize(255), "just below minimum should fail")
    assert.NotNil(t, v.ValidateChunkSize(8448), "just above maximum should fail")
}
```
