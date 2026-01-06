param (
    [Parameter(Mandatory = $true)]
    [string]$ListFile
)

# Validasi file list
if (-not (Test-Path $ListFile)) {
    Write-Host "ERROR: File list tidak ditemukan: $ListFile"
    exit 1
}

# Ambil root directory dari file list
$RootDir = Split-Path -Parent $ListFile

# Tentukan output file
$OutputFile = Join-Path $RootDir "bundled_output.txt"

# Kosongkan / buat ulang file output
"" | Set-Content $OutputFile

# Baca semua path di file list
$Paths = Get-Content $ListFile | Where-Object { $_.Trim() -ne "" }

foreach ($RelativePath in $Paths) {

    $FullPath = Join-Path $RootDir $RelativePath

    if (Test-Path $FullPath) {

        Add-Content $OutputFile "============================================================"
        Add-Content $OutputFile "FILE PATH: $RelativePath"
        Add-Content $OutputFile "FULL PATH: $FullPath"
        Add-Content $OutputFile "============================================================"
        Add-Content $OutputFile ""

        Get-Content $FullPath | Add-Content $OutputFile

        Add-Content $OutputFile "`n`n"
    }
    else {
        Add-Content $OutputFile "WARNING: FILE NOT FOUND -> $RelativePath"
        Add-Content $OutputFile "`n`n"
    }
}

Write-Host "Bundling selesai."
Write-Host "Output tersimpan di:"
Write-Host $OutputFile
