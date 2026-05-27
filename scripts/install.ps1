<#
.SYNOPSIS
  opencode-impm 安装脚本（PowerShell版）
.DESCRIPTION
  将 assets/ 下的 commands、agents、skills 复制到项目的 .opencode/ 目录，并更新 opencode.json 配置
.USAGE
  .\scripts\install.ps1
#>

# 遇到错误立即停止执行
$ErrorActionPreference = "Stop"
$InformationPreference = "Continue"

# 脚本所在目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
# 项目根目录（脚本目录的上一级）
$ProjectRoot = Resolve-Path (Join-Path $ScriptDir "..")
# assets 资源目录
$AssetsDir = Join-Path $ProjectRoot "assets"
# OpenCode 运行时配置目录
$OpenCodeDir = Join-Path $ProjectRoot ".opencode"
# 需要复制的目录列表
$AssetDirs = @("commands", "agents", "skills")

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  opencode-impm 安装脚本" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "项目根目录: $ProjectRoot"
Write-Host "资源目录: $AssetsDir"
Write-Host "目标目录: $OpenCodeDir"
Write-Host ""

# 确保 .opencode 目录存在
if (-not (Test-Path $OpenCodeDir)) {
  New-Item -ItemType Directory -Path $OpenCodeDir -Force | Out-Null
}

# 逐一复制 commands、agents、skills 目录
foreach ($dir in $AssetDirs) {
  $srcDir = Join-Path $AssetsDir $dir
  $destDir = Join-Path $OpenCodeDir $dir

  if (-not (Test-Path $srcDir)) {
    Write-Host "  跳过：源目录不存在 $srcDir" -ForegroundColor Yellow
    continue
  }

  Write-Host "复制 $dir/ ..."

  # 确保目标目录存在
  if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
  }

  # 递归复制所有文件，保持目录结构
  Get-ChildItem -Path $srcDir -Recurse | ForEach-Object {
    $relativePath = $_.FullName.Substring($srcDir.Length + 1)
    $destPath = Join-Path $destDir $relativePath

    if ($_.PSIsContainer) {
      # 目录不存在则创建
      if (-not (Test-Path $destPath)) {
        New-Item -ItemType Directory -Path $destPath -Force | Out-Null
      }
    } else {
      # 确保父目录存在后复制文件
      $parentDir = Split-Path -Parent $destPath
      if (-not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
      }
      Copy-Item -Path $_.FullName -Destination $destPath -Force
      Write-Host "  复制: $($_.Name)"
    }
  }
}

Write-Host ""

# 更新 opencode.json，添加 opencode-impm 到 plugin 列表
Write-Host "更新 opencode.json 配置..."
$configPath = Join-Path $ProjectRoot "opencode.json"

if (Test-Path $configPath) {
  try {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
  } catch {
    Write-Host "  opencode.json 解析失败，将重新创建" -ForegroundColor Yellow
    $config = @{}
  }
} else {
  $config = @{}
}

# 确保 plugin 数组中包含 opencode-impm
if (-not $config.plugin) {
  $config.plugin = @()
}
if ($config.plugin -notcontains "opencode-impm") {
  $config.plugin += "opencode-impm"
}
# 添加 schema 地址（如果尚未设置）
if (-not $config.'$schema') {
  $config | Add-Member -NotePropertyName '$schema' -NotePropertyValue "https://opencode.ai/config.json"
}

# 将配置写回文件
$config | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8
Write-Host "  配置文件已更新: $configPath"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  安装完成！" -ForegroundColor Cyan
Write-Host "  使用 /impm 命令启动AI项目经理全流程开发。" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
