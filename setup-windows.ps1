$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
$python = if (Get-Command py -ErrorAction SilentlyContinue) { "py" } else { "python" }
& $python -m venv .venv
& .\.venv\Scripts\python.exe -m pip install --upgrade pip
& .\.venv\Scripts\python.exe -m pip install -r requirements.txt
Write-Host "`nSetup complete. Start with: .\.venv\Scripts\python.exe app.py"
