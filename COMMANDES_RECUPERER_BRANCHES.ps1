# Script PowerShell pour récupérer les nouvelles branches Git
# Utilisez ces commandes une fois votre connexion Internet rétablie

Write-Host "🔄 Récupération des branches depuis GitHub..." -ForegroundColor Cyan

# 1. Récupérer toutes les branches distantes
Write-Host "`n1. Récupération des métadonnées des branches..." -ForegroundColor Yellow
git fetch --all

# 2. Lister les branches distantes
Write-Host "`n2. Branches distantes disponibles:" -ForegroundColor Yellow
git branch -r

# 3. Vérifier s'il y a de nouvelles branches
Write-Host "`n3. Recherche de nouvelles branches..." -ForegroundColor Yellow

# Récupérer la branche 'mobile' qui n'existe pas encore en local
Write-Host "`n4. Création de la branche locale 'mobile' depuis origin/mobile..." -ForegroundColor Green
git checkout -b mobile origin/mobile

# Afficher toutes les branches
Write-Host "`n✅ Branches locales:" -ForegroundColor Green
git branch

Write-Host "`n✅ Récupération terminée!" -ForegroundColor Green

