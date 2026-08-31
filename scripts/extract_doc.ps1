Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead("documentos/02-Documento-Proyecto-Completo-RGMotors-PuertoMontt.docx")
$entry = $zip.Entries | Where-Object { $_.FullName -eq "word/document.xml" }
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xml = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()
$text = [regex]::Replace($xml, "<[^>]+>", " ")
[System.IO.File]::WriteAllText("documentos/02-Documento-Proyecto-Completo.txt", $text, [System.Text.Encoding]::UTF8)
Write-Host "Extracted successfully"
