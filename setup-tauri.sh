#!/bin/bash
# 文墨天机 · Tauri 原生APP 打包脚本
# 使用前请安装: cargo install tauri-cli
# 然后运行: bash setup-tauri.sh

set -e

echo "🔧 文墨天机 Tauri 打包设置"
echo "=========================="

# 检查 Rust
if ! command -v cargo &> /dev/null; then
  echo "❌ 未安装 Rust。请访问 https://rustup.rs 安装"
  exit 1
fi

# 检查 Tauri CLI
if ! cargo install --list 2>/dev/null | grep -q "tauri-cli"; then
  echo "📦 安装 Tauri CLI..."
  cargo install tauri-cli --version "^2"
fi

# 创建 src-tauri 目录结构
mkdir -p src-tauri/src
mkdir -p src-tauri/icons

# 如果已有图标，复制
if [ -f "icon-192.png" ]; then
  cp icon-192.png src-tauri/icons/icon.png 2>/dev/null || true
fi

# 生成 Cargo.toml
cat > src-tauri/Cargo.toml << 'EOF'
[package]
name = "wenmo-tianji"
version = "1.0.0"
edition = "2021"
description = "文墨天机 · 山医命相卜五术玄学"
authors = ["wenmo-tianji"]

[lib]
name = "wenmo_tianji_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
EOF

# 生成 build.rs
cat > src-tauri/build.rs << 'EOF'
fn main() {
    tauri_build::build()
}
EOF

# 生成 main.rs
cat > src-tauri/src/main.rs << 'EOF'
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    wenmo_tianji_lib::run()
}
EOF

# 生成 lib.rs
cat > src-tauri/src/lib.rs << 'EOF'
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
EOF

# 生成 Capabilities
mkdir -p src-tauri/capabilities
cat > src-tauri/capabilities/default.json << 'EOF'
{
  "identifier": "default",
  "description": "Default capabilities",
  "windows": ["main"],
  "permissions": ["core:default"]
}
EOF

echo ""
echo "✅ 设置完成！"
echo ""
echo "运行以下命令进行开发:"
echo "  cargo tauri dev"
echo ""
echo "运行以下命令进行构建:"
echo "  cargo tauri build"
echo ""
echo "生成的应用将在 src-tauri/target/release/bundle/ 目录下"
