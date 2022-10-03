import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  interval,
  last,
  map,
  Observable,
  Subject,
  switchMap,
  takeWhile,
} from 'rxjs';
import { elementAt, tap, filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  // Permet de référencer une instance d’un composant en déclarant une propriété du type du composant enfant, puis en la décorant du décorateur @ViewChild. Le décorateur prend en paramètre un type ou bien une chaîne de caractères.
  @ViewChild('terrainJeu') terrainJeu!: ElementRef;
  @ViewChild('invader1') invader1!: ElementRef;
  @ViewChild('')

  //position de départ du bloc
  top = 0;
  //Vitesse du jeu
  vitesseJeu = 100;
  //Vitesse du bloc
  vitesseBloc = 0.5;

  //
  horizontalMoveOffset = 10;

  // Observables
  gameActions$: Observable<number>;
  countDown$: Observable<number>;

  // Subject
  keyboardSubject$ = new Subject<string>();

  // Décompte
  initialCountDown = 5;
  countDown!: number;
  left = 100;
  right = 100;

  opened: number;

  constructor() {
    // Vitesse du décompte
    this.countDown$ = interval(1000).pipe(
      map((resultat) => this.initialCountDown - resultat),
      tap((resultat) => (this.countDown = resultat)),
      takeWhile((resultat) => resultat >= 0),
      filter((resultat) => resultat === 0),
      tap((_) => this.initGame()),
      tap(console.log)
    );
    this.gameActions$ = this.countDown$.pipe(
      switchMap((countDown) => this.gameLoop())
    );

    this.gameActions$.subscribe();

    this.keyboardSubject$
      .pipe(
        filter((k) => ['ArrowLeft', 'ArrowRight'].indexOf(k) >= 0),
        tap(console.log),
        tap((key) => {
          switch (key) {
            case 'ArrowLeft':
              this.left -= this.horizontalMoveOffset;
              break;
            case 'ArrowRight':
              this.left += this.horizontalMoveOffset;
              break;
          }
          console.log(this.left);
        })
      )
      .subscribe();
  }

  ngOnInit() {}

  initGame() {
    this.countDown = this.initialCountDown;
    // Position de départ du bloc
    this.top = 0;
  }

  gameLoop() {
    // Retourne un Observable qui émet des nombres séquentiels à chaque intervalle de temps spécifié.
    return interval(this.vitesseJeu).pipe(
      // Tap permet d'effectuer de manière transparente des actions ou des effets secondaires, comme la journalisation.

      tap((_) => (this.top += this.vitesseBloc)),
      // Continue tant que le bloc n'est pas arrivé en bas
      takeWhile(
        (_) =>
          this.top + this.invader1.nativeElement.clientHeight <
          this.terrainJeu.nativeElement.clientHeight
      ),
      last(),
      // Affiche le message d'alerte lorsque l'observable est complété
      // tap((_) => alert('You loooooose')),
      map((_) => 0)
    );
  }

  @HostListener('window:keydown', ['$event'])
  keyEvent(keyEvent: KeyboardEvent) {
    this.keyboardSubject$.next(keyEvent.key);
  }
}
