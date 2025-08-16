param (
    [string]$ProjectPath = (Get-Location).Path
)

# Daftar ekstensi file kode yang dianggap relevan
$CodeExtensions = @(".ts", ".tsx", ".js", ".jsx", ".css", ".json", ".mjs", ".env", ".env.local")

# Daftar folder yang diabaikan
$IgnoredFolders = @(".next", ".swc", ".vscode", "node_modules")

# Fungsi untuk memeriksa apakah path diabaikan
function Is-IgnoredPath($path) {
    foreach ($ignored in $IgnoredFolders) {
        if ($path -like "*\$ignored\*") {
            return $true
        }
    }
    return $false
}

# Mendapatkan semua file di direktori proyek
$files = Get-ChildItem -Path $ProjectPath -Recurse -File | Where-Object {
    ($_.Extension -in $CodeExtensions -or $_.Name -eq ".env" -or $_.Name -eq ".env.local") -and -not (Is-IgnoredPath $_.FullName)
}

# Output isi file ke file teks
$outputFile = Join-Path $ProjectPath "semua-file-kodingan.txt"
if (Test-Path $outputFile) { Remove-Item $outputFile -Force }

# Logging untuk debugging
Write-Host "File yang akan diproses:"
foreach ($file in $files) {
    Write-Host $file.FullName
}

# Menggunakan StreamWriter untuk menulis ke file dengan encoding UTF-8
$writer = [System.IO.StreamWriter]::new($outputFile, $false, [System.Text.Encoding]::UTF8)
try {
    foreach ($file in $files) {
        $relativePath = $file.FullName.Substring($ProjectPath.Length + 1)
        $writer.WriteLine("===== $relativePath =====")
        $content = [System.IO.File]::ReadAllText($file.FullName)
        $writer.WriteLine($content)
        $writer.WriteLine("")
    }
}
finally {
    $writer.Close()
}

Write-Host "Isi file kode telah disimpan ke $outputFile"