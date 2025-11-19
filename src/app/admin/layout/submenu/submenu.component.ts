import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  HostListener,
  AfterViewInit,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, Subscription, timer } from 'rxjs';
import { debounce } from 'rxjs/operators';

export interface Submenu {
  title: string;
  route: string;
  icon?: string;
}
@Component({
  selector: 'app-submenu',
  standalone: false,
  templateUrl: './submenu.component.html',
  styleUrl: './submenu.component.css'
})
export class SubmenuComponent {
  
  @Input() submenus: Submenu[] = [];
  @Input() activeRoute = '';
  @Output() submenuSelected = new EventEmitter<string>();

  /** FIX #1 → MUST be static:false */
  @ViewChild('container', { static: false }) containerRef!: ElementRef<HTMLDivElement>;

  visibleSubmenus: Submenu[] = [];
  hiddenSubmenus: Submenu[] = [];
  isDropdownOpen = false;

  private resizeSub?: Subscription;
  private reservedWidth = 130; // space for More button

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => this.adjustSubmenus(), 50);

    this.resizeSub = fromEvent(window, 'resize')
      .pipe(debounce(() => timer(150)))
      .subscribe(() => this.adjustSubmenus());
  }

  ngOnDestroy(): void {
    this.resizeSub?.unsubscribe();
  }

  /** SELECT SUBMENU */
  selectSubmenu(route: string): void {
    this.isDropdownOpen = false;
    this.submenuSelected.emit(route);
    if (route !== '#') this.router.navigate([route]).catch(() => {});
  }

  /** TOGGLE DROPDOWN */
  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
    this.cdr.detectChanges();
  }

  /** CLICK OUTSIDE */
  @HostListener('document:click')
  closeDropdownOnOutside() {
    if (this.isDropdownOpen) {
      this.isDropdownOpen = false;
      this.cdr.detectChanges();
    }
  }

  stopProp(evt: MouseEvent) {
    evt.stopPropagation();
  }

  /** AUTO-ADJUST SUBMENU WIDTH */
  adjustSubmenus(): void {
    const containerEl = this.containerRef?.nativeElement;
    if (!containerEl) return;

    const containerWidth = containerEl.getBoundingClientRect().width;
    const availableWidth = containerWidth - this.reservedWidth;

    const temp = document.createElement('div');
    temp.style.position = 'absolute';
    temp.style.visibility = 'hidden';
    temp.style.whiteSpace = 'nowrap';
    temp.style.font = getComputedStyle(containerEl).font;
    document.body.appendChild(temp);

    const visible: Submenu[] = [];
    const hidden: Submenu[] = [];

    let usedWidth = 0;

    for (const sub of this.submenus) {
      temp.innerText = sub.title;
      const iconWidth = sub.icon ? 22 : 0;
      const width = temp.offsetWidth + iconWidth + 48;

      if (usedWidth + width <= availableWidth || visible.length === 0) {
        visible.push(sub);
        usedWidth += width;
      } else {
        hidden.push(sub);
      }
    }

    document.body.removeChild(temp);

    this.visibleSubmenus = visible;
    this.hiddenSubmenus = hidden;

    this.cdr.detectChanges();
  }

  isActive(route: string) {
    return this.activeRoute === route;
  }
}
