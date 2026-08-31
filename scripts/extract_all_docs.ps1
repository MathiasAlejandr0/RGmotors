Add-Type -AssemblyName System.IO.Compression.FileSystem

function Extract-Docx($path, $outPath) {
    $zip = [System.IO.Compression.ZipFile]::OpenRead($path)
    $entry = $zip.Entries | Where-Object { $_.FullName -eq "word/document.xml" }
    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $xml = $reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    $zip.Dispose()
    $text = [regex]::Replace($xml, "<[^>]+>", " ")
    [System.IO.File]::WriteAllText($outPath, $text, [System.Text.Encoding]::UTF8)
}

Extract-Docx "documentos/01-Solicitud-Decisiones-y-Accesos-RGMotors-PuertoMontt.docx" "documentos/01-Solicitud.txt"
Extract-Docx "documentos/03-Anexo-Checklist-Captura-Vehiculo.docx" "documentos/03-Checklist.txt"
Write-Host "All extracted."
