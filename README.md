# For Each

Glob the filesystem to create `matrix` definitions for parallel jobs

## Usage

## Simple

```yaml
steps:
  - uses: actions/checkout@v4
  - run: tree
    # .
    # ├── function-a
    # │   └── file.txt
    # ├── function-b
    # │   └── file.txt
    # └── other-folder
    #     └── file.txt
  - id: for-each
    uses: colpal/actions-for-each
    with:
      patterns: |
        **/file.txt
        !other-folder/*
  - run: echo ${{ steps.for-each.outputs.matches }}
    # ["function-a/file.txt","function-b/file.txt"]
```

### Parallel

```yaml
jobs:
  divide:
    steps:
      - uses: actions/checkout@v4
      - run: tree
        # .
        # ├── function-a
        # │   ├── main.py
        # │   └── deploy.sh
        # ├── function-b
        # │   ├── main.js
        # │   └── deploy.sh
        # └── other-folder
        #     ├── main.js
        #     └── deploy.sh
      - id: for-each
        uses: colpal/actions-for-each
        with:
          patterns: 'function-*'
    outputs:
      # ["function-a/", "function-b/"]
      matches: ${{ steps.for-each.outputs.matches }}

  conquer:
    needs: divide
    strategy:
      matrix:
        path: ${{ fromJSON(needs.divide.outputs.matches) }}
    steps:
      - uses: actions/checkout@v4
      - run: ./deploy.sh
        working-directory: ${{ matrix.path }}
```
