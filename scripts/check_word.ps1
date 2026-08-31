try {
    $word = New-Object -ComObject Word.Application
    $word.Quit()
    Write-Host "Word COM is available"
} catch {
    Write-Host "Word COM not available: $($_.Exception.Message)"
}
