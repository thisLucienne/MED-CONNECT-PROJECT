import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/layout/sidebar/sidebar';
import { Header } from './components/layout/header/header';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('nedcsss');
  private themeService = inject(ThemeService);

  ngOnInit() {
    // Initialiser le thème global au démarrage de l'application
    this.themeService.initTheme();
  }
}
