import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FLASHCARDS } from './flashcards.data';
import { MathPipe } from './math.pipe';

@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [CommonModule, MathPipe],
  templateUrl: './flashcards.component.html',
  styleUrl: './flashcards.component.scss',
})
export class FlashcardsComponent {
  currentIndex = signal(0);
  flipped = signal(false);

  cards = computed(() => FLASHCARDS);
  currentCard = computed(() => this.cards()[this.currentIndex()] ?? this.cards()[0]);
  progress = computed(() => {
    const total = this.cards().length;
    if (total === 0) return 0;
    return Math.round(((this.currentIndex() + 1) / total) * 100);
  });

  flip() {
    this.flipped.update((value) => !value);
  }

  previous() {
    const total = this.cards().length;
    if (total === 0) return;
    this.currentIndex.update((index) => (index - 1 + total) % total);
    this.flipped.set(false);
  }

  next() {
    const total = this.cards().length;
    if (total === 0) return;
    this.currentIndex.update((index) => (index + 1) % total);
    this.flipped.set(false);
  }

  goStudy() {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}
