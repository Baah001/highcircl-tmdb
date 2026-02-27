import { HttpInterceptorFn, HttpParams, HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { tmdbAuthInterceptor } from './tmdb-auth.interceptor';
import { TMDB_CONFIG } from '../../config/tmdb-config.token';

describe('tmdbAuthInterceptor', () => {
  const tmdbConfig = {
    baseUrl: 'https://api.themoviedb.org/3',
    apiKey: 'test-api-key',
    language: 'en-US',
  };

  const createNext = () =>
    vi.fn((request: HttpRequest<unknown>) => request);

  it('passes through non-TMDB requests unchanged', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: TMDB_CONFIG, useValue: tmdbConfig }],
    });

    const request = new HttpRequest('GET', 'https://example.com/foo');
    const next = createNext();

    const result = TestBed.runInInjectionContext(() =>
      tmdbAuthInterceptor(request, next as unknown as Parameters<HttpInterceptorFn>[1])
    );

    expect(next).toHaveBeenCalledTimes(1);
    const forwardedRequest = next.mock.calls[0]?.[0] as HttpRequest<unknown>;

    expect(forwardedRequest.url).toBe(request.url);
    expect(forwardedRequest.params.toString()).toBe(request.params.toString());
    expect(result).toBe(forwardedRequest as unknown);
  });

  it('adds api_key and language for TMDB requests when missing', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: TMDB_CONFIG, useValue: tmdbConfig }],
    });

    const request = new HttpRequest('GET', `${tmdbConfig.baseUrl}/movie/popular`);
    const next = createNext();

    TestBed.runInInjectionContext(() => {
      tmdbAuthInterceptor(request, next as unknown as Parameters<HttpInterceptorFn>[1]);
    });

    const forwardedRequest = next.mock.calls[0]?.[0] as HttpRequest<unknown>;

    expect(forwardedRequest.url).toBe(request.url);
    expect(forwardedRequest.params.get('api_key')).toBe(tmdbConfig.apiKey);
    expect(forwardedRequest.params.get('language')).toBe(tmdbConfig.language);
  });

  it('does not override api_key if it already exists', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: TMDB_CONFIG, useValue: tmdbConfig }],
    });

    const params = new HttpParams().set('api_key', 'existing-key');
    const request = new HttpRequest(
      'GET',
      `${tmdbConfig.baseUrl}/search/movie`,
      { params }
    );

    const next = createNext();

    TestBed.runInInjectionContext(() => {
      tmdbAuthInterceptor(request, next as unknown as Parameters<HttpInterceptorFn>[1]);
    });

    const forwardedRequest = next.mock.calls[0]?.[0] as HttpRequest<unknown>;

    expect(forwardedRequest.params.get('api_key')).toBe('existing-key');
    expect(forwardedRequest.params.get('language')).toBe(tmdbConfig.language);
  });

  it('does not override language if it already exists', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: TMDB_CONFIG, useValue: tmdbConfig }],
    });

    const params = new HttpParams().set('language', 'nl-NL');
    const request = new HttpRequest(
      'GET',
      `${tmdbConfig.baseUrl}/movie/123`,
      { params }
    );

    const next = createNext();

    TestBed.runInInjectionContext(() => {
      tmdbAuthInterceptor(request, next as unknown as Parameters<HttpInterceptorFn>[1]);
    });

    const forwardedRequest = next.mock.calls[0]?.[0] as HttpRequest<unknown>;

    expect(forwardedRequest.params.get('api_key')).toBe(tmdbConfig.apiKey);
    expect(forwardedRequest.params.get('language')).toBe('nl-NL');
  });

  it('keeps existing query params and adds missing TMDB params', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: TMDB_CONFIG, useValue: tmdbConfig }],
    });

    const params = new HttpParams().set('page', '2').set('region', 'NL');
    const request = new HttpRequest(
      'GET',
      `${tmdbConfig.baseUrl}/movie/popular`,
      { params }
    );

    const next = createNext();

    TestBed.runInInjectionContext(() => {
      tmdbAuthInterceptor(request, next as unknown as Parameters<HttpInterceptorFn>[1]);
    });

    const forwardedRequest = next.mock.calls[0]?.[0] as HttpRequest<unknown>;

    expect(forwardedRequest.params.get('page')).toBe('2');
    expect(forwardedRequest.params.get('region')).toBe('NL');
    expect(forwardedRequest.params.get('api_key')).toBe(tmdbConfig.apiKey);
    expect(forwardedRequest.params.get('language')).toBe(tmdbConfig.language);
  });
});
