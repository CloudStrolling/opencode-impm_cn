<#
.SYNOPSIS
  opencode-impm 安装脚本（PowerShell版）
.DESCRIPTION
  将 assets/ 下的 commands、agents、skills 复制到目标项目的 .opencode/ 目录，并更新 opencode.json 配置。
  支持 npm 依赖安装场景（通过 INIT_CWD 自动检测目标项目）。
.PARAMETER Target
  目标项目根目录（可选）。不指定时自动检测：
  1. 如果 $env:INIT_CWD 存在（npm install 场景），使用 INIT_CWD
  2. 否则使用当前脚本所在项目的根目录
.EXAMPLE
  .\scripts\install.ps1
  .\scripts\install.ps1 -Target "D:\projects\my-app"
#>

param(
    [string]$Target = ""
)

$ErrorActionPreference = "Stop"
$InformationPreference = "Continue"

# 脚本所在目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
# 插件根目录（脚本目录的上一级）
$PluginRoot = Resolve-Path (Join-Path $ScriptDir "..")
# assets 资源目录
$AssetsDir = Join-Path $PluginRoot "assets"
# 需要复制的目录列表
$AssetDirs = @("commands", "agents", "skills")

# 确定目标项目根目录
function Resolve-TargetProject {
    if ($Target) {
        if ([System.IO.Path]::IsPathRooted($Target)) {
            return $Target
        }
        return Resolve-Path (Join-Path (Get-Location) $Target) -ErrorAction SilentlyContinue
    }

    # npm 依赖安装场景
    $initCwd = $env:INIT_CWD
    if ($initCwd) {
        $resolved = Resolve-Path $initCwd -ErrorAction SilentlyContinue
        if ($resolved -and ($resolved.Path -ne $PluginRoot)) {
            return $resolved.Path
        }
    }

    # 回退到当前工作目录
    return (Get-Location).Path
}

$TargetRoot = Resolve-TargetProject

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  opencode-impm 安装脚本" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "插件目录: $PluginRoot"
Write-Host "资源目录: $AssetsDir"
Write-Host "目标项目: $TargetRoot"
Write-Host ""

if (-not (Test-Path $AssetsDir)) {
    Write-Host "错误：资源目录不存在，请确保在 opencode-impm 插件目录中运行此脚本" -ForegroundColor Red
    Write-Host "      $AssetsDir" -ForegroundColor Red
    exit 1
}

# 目标项目的 .opencode 目录
$OpenCodeDir = Join-Path $TargetRoot ".opencode"

# 逐一复制 commands、agents、skills 目录
foreach ($dir in $AssetDirs) {
    $srcDir = Join-Path $AssetsDir $dir
    $destDir = Join-Path $OpenCodeDir $dir

    if (-not (Test-Path $srcDir)) {
        Write-Host "  跳过：资源目录不存在 $srcDir" -ForegroundColor Yellow
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
            if (-not (Test-Path $destPath)) {
                New-Item -ItemType Directory -Path $destPath -Force | Out-Null
            }
        } else {
            $parentDir = Split-Path -Parent $destPath
            if (-not (Test-Path $parentDir)) {
                New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
            }
            Copy-Item -Path $_.FullName -Destination $destPath -Force
        }
    }
}

Write-Host ""

# 更新目标项目的 opencode.json
Write-Host "更新 opencode.json 配置..."
$configPath = Join-Path $TargetRoot "opencode.json"

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

if (-not $config.plugin) {
    $config.plugin = @()
}
if ($config.plugin -notcontains "opencode-impm") {
    $config.plugin += "opencode-impm"
}
if (-not $config.'$schema') {
    $config | Add-Member -NotePropertyName '$schema' -NotePropertyValue "https://opencode.ai/config.json"
}

$config | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8
Write-Host "  配置文件已更新: $configPath"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  安装完成！" -ForegroundColor Cyan
Write-Host "  使用 /impm 命令启动AI项目经理全流程开发。" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
