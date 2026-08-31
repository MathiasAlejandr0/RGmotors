$ErrorActionPreference = "Stop"

try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0

    $docPath = Join-Path $PSScriptRoot "..\documentos\02-Documento-Proyecto-Completo-RGMotors-PuertoMontt.docx"
    $docPath = [System.IO.Path]::GetFullPath($docPath)
    
    if (Test-Path $docPath) {
        $doc = $word.Documents.Open($docPath)
        
        $findObj = $doc.Content.Find
        $findObj.ClearFormatting()
        $findObj.Replacement.ClearFormatting()
        
        # Updates
        $null = $findObj.Execute("Versión 1.0", $false, $false, $false, $false, $false, $true, 1, $false, "Versión 1.2 (Arquitectura Cloud Costo $0)", 2)
        $null = $findObj.Execute("Versión 1.1", $false, $false, $false, $false, $false, $true, 1, $false, "Versión 1.2 (Arquitectura Cloud Costo $0)", 2)
        $null = $findObj.Execute("Supabase Pro", $false, $false, $false, $false, $false, $true, 1, $false, "Supabase Free Tier (Postgres)", 2)
        $null = $findObj.Execute("Vercel Pro", $false, $false, $false, $false, $false, $true, 1, $false, "Vercel Free Tier", 2)
        $null = $findObj.Execute("~US$20", $false, $false, $false, $false, $false, $true, 1, $false, "$0 USD (Free Tier)", 2)
        $null = $findObj.Execute("~US$25", $false, $false, $false, $false, $false, $true, 1, $false, "$0 USD (Free Tier)", 2)
        
        $doc.Save()
        $doc.Close()
        Write-Host "Updated 02 docx successfully."
    }

    $word.Quit()
} catch {
    Write-Host ("Error: " + $_.Exception.Message)
    if ($word) { $word.Quit() }
}
