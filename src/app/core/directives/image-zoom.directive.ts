import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appImageZoom]',
  standalone: true
})
export class ImageZoomDirective {
  private originalWidth: number;
  private originalHeight: number;
  private isZoomed: boolean = false;

  constructor(private elementRef: ElementRef) {
    this.originalWidth = this.elementRef.nativeElement.offsetWidth;
    this.originalHeight = this.elementRef.nativeElement.offsetHeight;
  }

  @HostListener('click')
  toggleZoom() {
    const image = this.elementRef.nativeElement;

    if (!this.isZoomed) {
      this.originalWidth = image.offsetWidth;
      this.originalHeight = image.offsetHeight;
      image.style.width = '100vw';
      image.style.height = '100vh';
      image.style.maxWidth = '100vw';
      image.style.maxHeight = '100vh';
      image.style.objectFit = 'contain';
      image.style.position = 'fixed';
      image.style.top = '0';
      image.style.left = '0';
      image.style.zIndex = '9999';
    } else {
      image.style.width = `${this.originalWidth}px`;
      image.style.height = `${this.originalHeight}px`;
      image.style.maxWidth = 'none';
      image.style.maxHeight = 'none';
      image.style.objectFit = 'contain';
      image.style.position = 'static';
      image.style.top = 'auto';
      image.style.left = 'auto';
      image.style.zIndex = 'auto';
    }

    this.isZoomed = !this.isZoomed;
  }
}