import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideRouter, RouterLink } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { MovieListItemComponent } from './movie-list-item.component';
import type { MovieListItemModel } from '../../../core/tmdb/models/movie.models';

@Component({
  selector: 'app-rating',
  standalone: true,
  template: `<div data-testid="rating">{{ rating }}</div>`,
})
class RatingStubComponent {
  @Input({ required: true }) rating!: number;
}

describe('MovieListItemComponent', () => {
  const movie: MovieListItemModel = {
    id: 42,
    title: 'Interstellar',
    releaseDate: '2014-11-07',
    posterThumbnailUrl: 'https://image.tmdb.org/t/p/w185/poster.jpg',
    rating: 8.6,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MovieListItemComponent],
      providers: [ provideRouter([]),]
    })
      .overrideComponent(MovieListItemComponent, {
        set: {
          imports: [RouterLink, RatingStubComponent],
        },
      })
      .compileComponents();
  });

  it('renders title, formatted release date, poster and rating', () => {
    const fixture = TestBed.createComponent(MovieListItemComponent);

    fixture.componentRef.setInput('movie', movie);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;

    expect(element.textContent).toContain('Interstellar');
    expect(element.textContent).toContain('Nov');
    expect(element.textContent).toContain('2014');

    const img = element.querySelector('img.movie-row__poster') as HTMLImageElement | null;
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe(movie.posterThumbnailUrl);
    expect(img?.getAttribute('alt')).toBe(`${movie.title} poster`);

    const rating = element.querySelector('[data-testid="rating"]')?.textContent ?? '';
    expect(rating).toContain(String(movie.rating));
  });

  it('uses placeholder image when posterThumbnailUrl is missing', () => {
    const fixture = TestBed.createComponent(MovieListItemComponent);

    fixture.componentRef.setInput('movie', {
      ...movie,
      posterThumbnailUrl: undefined,
    });

    fixture.detectChanges();

    const img = (fixture.nativeElement as HTMLElement).querySelector(
      'img.movie-row__poster'
    ) as HTMLImageElement | null;

    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('assets/poster-placeholder.svg');
  });

  it('sets routerLink to /movies/:id', () => {
    const fixture = TestBed.createComponent(MovieListItemComponent);

    fixture.componentRef.setInput('movie', movie);
    fixture.detectChanges();

    const debugAnchor = fixture.debugElement.query(By.css('a.movie-row'));
    const routerLinkInstance = debugAnchor.injector.get(RouterLink);

    const urlTree = routerLinkInstance.urlTree;

    expect(urlTree?.toString()).toBe(`/movies/${movie.id}`);
  });

  it('exposes stable month + year for formatted date', () => {
    const fixture = TestBed.createComponent(MovieListItemComponent);

    fixture.componentRef.setInput('movie', movie);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    // Full date can differ slightly depending on environment/padding,
    // so just asserting month + year which should stay stable.
    expect(text).toContain('Nov');
    expect(text).toContain('2014');
  });
});
