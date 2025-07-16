# Các tính năng
- h -> Chia 2 giá trị 
- txt -> CSS các thuộc tính text PC
- sp-txt -> CSS các thuôc tính text SP
- hover -> Thêm hover cơ bản

# Phím tắt
- h -> h(|)
- txt -> @include txt (|fontSize, lineHeight, fontWeight, letterSpacing, color, fontFamily);
- sptxt -> @include sp-txt (|fontSize, lineHeight, fontWeight, letterSpacing, color, fontFamily);
- hover -> @include hover;|
- hoverunderline -> @include underline-hover();|
- ssp -> @include ssp {|}
- sp -> @include sp {|}
- stab -> @include stab {|}
- tab -> @include tab {|}
- spc -> @include spc {|}
- pc -> @include pc {|}
- lpc -> @include lpc {|}
- bg -> @include bg (pcUrl, tabUrl, spUrl, repeato-repeat, positionenter, sizeover)

# Snippet
## Global src
%APPDATA%\Code\User\snippets

## Code
```json
{
  "h": {
    "prefix": "h",
    "body": ["h($1)"],
    "description": "Tạo thẻ h()"
  },
  "txt": {
    "prefix": "txt",
    "body": ["@include txt ($1fontSize, lineHeight, fontWeight, letterSpacing, color, fontFamily);"],
    "description": "Gọi mixin txt"
  },
  "sptxt": {
    "prefix": "sptxt",
    "body": ["@include sp-txt ($1fontSize, lineHeight, fontWeight, letterSpacing, color, fontFamily);"],
    "description": "Gọi mixin sp-txt"
  },
  "hover": {
    "prefix": "hover",
    "body": ["@include hover;$1"],
    "description": "Gọi mixin hover"
  },
  "hoverunderline": {
    "prefix": "hoverunderline",
    "body": ["@include underline-hover();$1"],
    "description": "Gọi mixin underline-hover"
  },
  "ssp": {
    "prefix": "ssp",
    "body": ["@include ssp {", "\t$1", "}"],
    "description": "Gọi mixin ssp"
  },
  "sp": {
    "prefix": "sp",
    "body": ["@include sp {", "\t$1", "}"],
    "description": "Gọi mixin sp"
  },
  "stab": {
    "prefix": "stab",
    "body": ["@include stab {", "\t$1", "}"],
    "description": "Gọi mixin stab"
  },
  "tab": {
    "prefix": "tab",
    "body": ["@include tab {", "\t$1", "}"],
    "description": "Gọi mixin tab"
  },
  "spc": {
    "prefix": "spc",
    "body": ["@include spc {", "\t$1", "}"],
    "description": "Gọi mixin spc"
  },
  "pc": {
    "prefix": "pc",
    "body": ["@include pc {", "\t$1", "}"],
    "description": "Gọi mixin pc"
  },
  "lpc": {
    "prefix": "lpc",
    "body": ["@include lpc {", "\t$1", "}"],
    "description": "Gọi mixin lpc"
  },
  "bg": {
    "prefix": "bg",
    "body": ["@include bg ($1pcUrl, repeato-repeat, positionenter, sizeover\n);"],
    "description": "Gọi mixin lpc"
  }
}
```