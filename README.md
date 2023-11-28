# For Each

Glob the filesystem to create `matrix` definitions for parallel jobs. This
action uses [globby](https://github.com/sindresorhus/globby) under the hood

## Usage

### Simple

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
    uses: colpal/actions-for-each@v0.1
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
        uses: colpal/actions-for-each@v0.1
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

## Reference

For more details on the supported patterns, see
[here](https://github.com/sindresorhus/globby#globbing-patterns)

```yaml
steps:
  - id: for-each
    uses: colpal/actions-for-each@v0.1
    with:
      # REQUIRED
      # The pattern(s) to be used to find folders/files. More than one pattern
      # may be supplied by putting each on its own line.
      patterns: string
outputs:
  # An JSON-formatted array of paths that matched the pattern(s)
  matches: ${{ steps.for-each.outputs.matches }}
```
