import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
 @Input() collapsed = false;
  @Input() activeMenu: string = ''; // Comes from parent
  @Output() menuSelected = new EventEmitter<string>();

  selectMenu(menu: string) {
    // Update active in sidebar itself
    this.activeMenu = menu;

    // Notify parent layout
    this.menuSelected.emit(menu);
  }
}
