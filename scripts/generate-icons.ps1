Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path -Parent $PSScriptRoot
foreach ($size in @(180,192,512)) {
    $bitmap = New-Object System.Drawing.Bitmap($size,$size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#315e49'))
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#e5edcf'))
    $center = $size / 2.0
    $graphics.TranslateTransform($center,$center)
    for ($i=0; $i -lt 8; $i++) {
        $graphics.FillEllipse($brush, [single](-27*$size/512), [single](-143*$size/512), [single](54*$size/512), [single](156*$size/512))
        $graphics.RotateTransform(45)
    }
    $inner = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#315e49'))
    $graphics.FillEllipse($inner,[single](-25*$size/512),[single](-25*$size/512),[single](50*$size/512),[single](50*$size/512))
    $name = if ($size -eq 180) {'apple-touch-icon.png'} else {"icon-$size.png"}
    $bitmap.Save((Join-Path $projectRoot $name),[System.Drawing.Imaging.ImageFormat]::Png)
    $inner.Dispose()
    $brush.Dispose()
    $graphics.Dispose()
    $bitmap.Dispose()
}
