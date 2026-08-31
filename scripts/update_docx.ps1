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
        
        # Replace Pro with Free
        $null = $findObj.Execute("Supabase Pro", $false, $false, $false, $false, $false, $true, 1, $false, "Supabase Free Tier (Postgres)", 2)
        $null = $findObj.Execute("Vercel Pro", $false, $false, $false, $false, $false, $true, 1, $false, "Vercel Free Tier", 2)
        $null = $findObj.Execute("~US$20", $false, $false, $false, $false, $false, $true, 1, $false, "$0 USD (Free Tier)", 2)
        $null = $findObj.Execute("~US$25", $false, $false, $false, $false, $false, $true, 1, $false, "$0 USD (Free Tier)", 2)
        $null = $findObj.Execute("Supabase (PostgreSQL)", $false, $false, $false, $false, $false, $true, 1, $false, "Supabase (PostgreSQL Free Tier) + Cloudflare R2 (10GB Fotos/Videos $0/mes)", 2)
        
        $doc.Save()
        $doc.Close()
        Write-Host "Updated 02 docx successfully."
    }

    $solPath = Join-Path $PSScriptRoot "..\documentos\01-Solicitud-Decisiones-y-Accesos-RGMotors-PuertoMontt.docx"
    $solPath = [System.IO.Path]::GetFullPath($solPath)
    if (Test-Path $solPath) {
        $doc2 = $word.Documents.Open($solPath)
        $findObj2 = $doc2.Content.Find
        $findObj2.ClearFormatting()
        $findObj2.Replacement.ClearFormatting()

        $null = $findObj2.Execute("Supabase Pro", $false, $false, $false, $false, $false, $true, 1, $false, "Supabase Free Tier (Postgres)", 2)
        $null = $findObj2.Execute("Vercel Pro", $false, $false, $false, $false, $false, $true, 1, $false, "Vercel Free Tier", 2)
        $null = $findObj2.Execute("~US$20/mes", $false, $false, $false, $false, $false, $true, 1, $false, "$0 USD (Free Tier)", 2)
        $null = $findObj2.Execute("~US$25/mes", $false, $false, $false, $false, $false, $true, 1, $false, "$0 USD (Free Tier)", 2)

        $doc2.Save()
        $doc2.Close()
        Write-Host "Updated 01 docx successfully."
    }

    $word.Quit()
} catch {
    Write-Host ("Error: " + $_.Exception.Message)
    if ($word) { $word.Quit() }
}
