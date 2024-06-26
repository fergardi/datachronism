import { Component, ChangeDetectorRef, OnDestroy, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router, ActivatedRoute } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar'; 
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheet, MatBottomSheetModule, MatBottomSheetRef } from '@angular/material/bottom-sheet'; 
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu'; 
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator'; 
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { FlexLayoutModule } from '@ngbracket/ngx-layout';

import { Card, CardResult, cards, empty} from '../model/card';

@Component({
  selector: 'app-info',
  templateUrl: 'card.component.html',
  styleUrl: './card.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    FlexLayoutModule,
  ],
})
export class CardComponent {
  constructor(
    public dialogRef: MatDialogRef<CardComponent>,
    @Inject(MAT_DIALOG_DATA) public card: Card,
  ) {}

  addCardToDeck(card: Card, event: Event): void {
    event.stopPropagation();
    this.dialogRef.close({card: card, event: event});
  }

  close(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrl: './rules.component.scss',
  standalone: true,
  imports: [],
})
export class RulesComponent {
  constructor(private rulesRef: MatBottomSheetRef<RulesComponent>) {}
}

@Component({
  selector: 'app-builder',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    FlexLayoutModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    ReactiveFormsModule,
    JsonPipe,
    CdkDropList, 
    CdkDrag,
    MatSliderModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatMenuModule,
    MatPaginatorModule,
  ],
  templateUrl: './builder.component.html',
  styleUrl: './builder.component.scss',
})
export class BuilderComponent implements AfterViewInit, OnDestroy {
  mobileQuery: MediaQueryList;
  @ViewChild('paginator') paginator!: MatPaginator;

  cards: Card[] = cards;
  pageIndex: number = 0;
  pageSize: number = 50;
  deck: Card[] = [];

  filters: FormGroup;
  search: FormGroup;

  cultures: string[] = [];
  types: string[] = [];
  subtypes: string[] = [];
  elements: any[] = []; // to allow nulls
  handsMin: number = 0;
  handsMax: number = 0;
  initiativeMin: number = 0;
  initiativeMax: number = 0;
  lifeMin: number = 0;
  lifeMax: number = 0;
  speedMin: number = 0;
  speedMax: number = 0;
  experienceMin: number = 0;
  experienceMax: number = 0;
  damageMin: number = 0;
  damageMax: number = 0;
  sets: string[] = [];

  private mobileQueryListener: () => void;

  constructor(
    private formBuilder: FormBuilder,
    private rulesRef: MatBottomSheet,
    private snackBar: MatSnackBar,
    private changeDetectorRef: ChangeDetectorRef, 
    private media: MediaMatcher,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 960px)');
    this.mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this.mobileQueryListener);

    this.cultures = Array.from(new Set(this.cards.map(card => card.culture).reduce((accumulator, culture) => accumulator.concat(culture, []))));
    this.types = Array.from(new Set(this.cards.map(card => card.type)));
    this.subtypes = Array.from(new Set(this.cards.map(card => card.subtype).reduce((accumulator, subtype) => accumulator.concat(subtype, []))));
    this.elements = Array.from(new Set(this.cards.filter(card => card.element != null).map(card => card.element)));
    this.handsMin = this.cards.reduce((min, card) => card.hands != null && card.hands < min ? card.hands : min, 0);
    this.handsMax = this.cards.reduce((max, card) => card.hands != null && card.hands > max ? card.hands : max, 0);
    this.initiativeMin = this.cards.reduce((min, card) => card.initiative != null && card.initiative < min ? card.initiative : min, 0);
    this.initiativeMax = this.cards.reduce((max, card) => card.initiative != null && card.initiative > max ? card.initiative : max, 0);
    this.lifeMin = this.cards.reduce((min, card) => card.life != null && card.life < min ? card.life : min, 0);
    this.lifeMax = this.cards.reduce((max, card) => card.life != null && card.life > max ? card.life : max, 0);
    this.speedMin = this.cards.reduce((min, card) => card.speed != null && card.speed < min ? card.speed : min, 0);
    this.speedMax = this.cards.reduce((max, card) => card.speed != null && card.speed > max ? card.speed : max, 0);
    this.experienceMin = this.cards.reduce((min, card) => card.experience != null && card.experience < min ? card.experience : min, 0);
    this.experienceMax = this.cards.reduce((max, card) => card.experience != null && card.experience > max ? card.experience : max, 0);
    this.damageMin = this.cards.reduce((min, card) => card.damage != null && card.damage < min ? card.damage : min, 0);
    this.damageMax = this.cards.reduce((max, card) => card.damage != null && card.damage > max ? card.damage : max, 0);
    this.sets = Array.from(new Set(this.cards.map(card => card.set)));

    this.filters = this.formBuilder.group({
      name: this.formBuilder.control(''),
      text: this.formBuilder.control(''),
      cultures: this.formBuilder.control([]),
      types: this.formBuilder.control([]),
      subtypes: this.formBuilder.control([]),
      handsMin: this.formBuilder.control(this.handsMin),
      handsMax: this.formBuilder.control(this.handsMax),
      grid_1_1: this.formBuilder.control(''),
      grid_1_2: this.formBuilder.control(''),
      grid_1_3: this.formBuilder.control(''),
      grid_2_1: this.formBuilder.control(''),
      grid_2_2: this.formBuilder.control(''),
      grid_2_3: this.formBuilder.control(''),
      grid_3_1: this.formBuilder.control(''),
      grid_3_2: this.formBuilder.control(''),
      grid_3_3: this.formBuilder.control(''),
      grid_4_1: this.formBuilder.control(''),
      grid_4_2: this.formBuilder.control(''),
      grid_4_3: this.formBuilder.control(''),
      elements: this.formBuilder.control([]),
      initiativeMin: this.formBuilder.control(this.initiativeMin),
      initiativeMax: this.formBuilder.control(this.initiativeMax),
      lifeMin: this.formBuilder.control(this.lifeMin),
      lifeMax: this.formBuilder.control(this.lifeMax),
      speedMin: this.formBuilder.control(this.speedMin),
      speedMax: this.formBuilder.control(this.speedMax),
      experienceMin: this.formBuilder.control(this.experienceMin),
      experienceMax: this.formBuilder.control(this.experienceMax),
      damageMin: this.formBuilder.control(this.damageMin),
      damageMax: this.formBuilder.control(this.damageMax),
      isMultipleWeapon: this.formBuilder.control(false),
      isMultipleArmor: this.formBuilder.control(false),
      isMultipleInspiration: this.formBuilder.control(false),
      isMultipleSpecial: this.formBuilder.control(false),
      isReveal: this.formBuilder.control(false),
      isAction: this.formBuilder.control(false),
      isRivalry: this.formBuilder.control(false),
      isDiscard: this.formBuilder.control(false),
      sets: this.formBuilder.control([]),
    });

    this.search = this.formBuilder.group({
      query: this.formBuilder.control(''),
    });

    this.deck = [];

    let hash = this.route.snapshot.queryParams['deck'] || null;
    if (hash) {
      let names: string[] = this.decodeDeck(hash);
      for (const name of names) {
        let card: Card = this.cards.find(c => c.name === name) || empty;
        this.deck.push(card);
      }
    } else {
      this.deck = [empty, empty, empty, empty, empty];
    }
  }

  ngAfterViewInit(): void {
    this.filters.valueChanges.subscribe(values => {
      this.paginator.firstPage();
    });

    this.search.valueChanges.subscribe(values => {
      this.paginator.firstPage();
    });

    this.resetAll();
  }

  resetAll(): void {
    this.resetFilters();
    this.resetSearch();
    this.resetName();
  }

  resetFilters(): void {
    this.filters.patchValue({
      'name': '',
      'text': '',
      'cultures': [],
      'types': [],
      'subtypes': [],
      'handsMin': 0,
      'handsMax': 2,
      'grid_1_1': '',
      'grid_1_2': '',
      'grid_1_3': '',
      'grid_2_1': '',
      'grid_2_2': '',
      'grid_2_3': '',
      'grid_3_1': '',
      'grid_3_2': '',
      'grid_3_3': '',
      'grid_4_1': '',
      'grid_4_2': '',
      'grid_4_3': '',
      'elements': [],
      'initiativeMin': this.initiativeMin,
      'initiativeMax': this.initiativeMax,
      'lifeMin': this.lifeMin,
      'lifeMax': this.lifeMax,
      'speedMin': this.speedMin,
      'speedMax': this.speedMax,
      'experienceMin': this.experienceMin,
      'experienceMax': this.experienceMax,
      'damageMin': this.damageMin,
      'damageMax': this.damageMax,
      'isMultipleWeapon': false,
      'isMultipleArmor': false,
      'isMultipleInspiration': false,
      'isMultipleSpecial': false,
      'isReveal': false,
      'isAction': false,
      'isRival': false,
      'isDiscard': false,
      'sets': [],
    });
    this.search.patchValue({
      'query': '',
    });
    this.paginator.firstPage();
    this.openNotification('Filters reseted to default!');
  }

  resetSearch(): void {
    this.search.patchValue({
      'query': '',
    });
  }

  resetName(): void {
    this.filters.patchValue({
      'name': '',
    });
  }

  filteredCards(): Card[] {
    return this.cards
      .filter(card => card.name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "").includes(this.search.get('query')?.value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "")) || card.text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "").includes(this.search.get('query')?.value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "")))
      .filter(card => card.name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "").includes(this.filters.get('name')?.value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "")))
      .filter(card => card.text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "").includes(this.filters.get('text')?.value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "")))
      .filter(card => this.filters.get('cultures')?.value.length > 0 ? this.filters.get('cultures')?.value.every((culture: string) => card.culture.includes(culture)) : true)
      .filter(card => this.filters.get('types')?.value.length > 0 ? this.filters.get('types')?.value.includes(card.type) : true)
      .filter(card => this.filters.get('subtypes')?.value.length > 0 ? this.filters.get('subtypes')?.value.every((subtype: string) => card.subtype.includes(subtype)) : true)
      .filter(card => card.hands != null ? card.hands >= this.filters.get('handsMin')?.value : this.filters.get('handsMin')?.value == 0) // only include null values if the min is 0
      .filter(card => card.hands != null ? card.hands <= this.filters.get('handsMax')?.value : true)
      .filter(card => card.grid_1_1.toLowerCase().includes(this.filters.get('grid_1_1')?.value.toLowerCase()))
      .filter(card => card.grid_1_2.toLowerCase().includes(this.filters.get('grid_1_2')?.value.toLowerCase()))
      .filter(card => card.grid_1_3.toLowerCase().includes(this.filters.get('grid_1_3')?.value.toLowerCase()))
      .filter(card => card.grid_2_1.toLowerCase().includes(this.filters.get('grid_2_1')?.value.toLowerCase()))
      .filter(card => card.grid_2_2.toLowerCase().includes(this.filters.get('grid_2_2')?.value.toLowerCase()))
      .filter(card => card.grid_2_3.toLowerCase().includes(this.filters.get('grid_2_3')?.value.toLowerCase()))
      .filter(card => card.grid_3_1.toLowerCase().includes(this.filters.get('grid_3_1')?.value.toLowerCase()))
      .filter(card => card.grid_3_2.toLowerCase().includes(this.filters.get('grid_3_2')?.value.toLowerCase()))
      .filter(card => card.grid_3_3.toLowerCase().includes(this.filters.get('grid_3_3')?.value.toLowerCase()))
      .filter(card => card.grid_4_1.toLowerCase().includes(this.filters.get('grid_4_1')?.value.toLowerCase()))
      .filter(card => card.grid_4_2.toLowerCase().includes(this.filters.get('grid_4_2')?.value.toLowerCase()))
      .filter(card => card.grid_4_3.toLowerCase().includes(this.filters.get('grid_4_3')?.value.toLowerCase()))
      .filter(card => this.filters.get('elements')?.value.length > 0 ? this.filters.get('elements')?.value.includes(card.element) : true)
      .filter(card => card.initiative != null ? card.initiative >= this.filters.get('initiativeMin')?.value : this.filters.get('initiativeMin')?.value == 0) // only include null values if the min is 0
      .filter(card => card.initiative != null ? card.initiative <= this.filters.get('initiativeMax')?.value : true)
      .filter(card => card.life != null ? card.life >= this.filters.get('lifeMin')?.value : this.filters.get('lifeMin')?.value == 0) // only include null values if the min is 0
      .filter(card => card.life != null ? card.life <= this.filters.get('lifeMax')?.value : true)
      .filter(card => card.speed != null ? card.speed >= this.filters.get('speedMin')?.value : this.filters.get('speedMin')?.value == 0) // only include null values if the min is 0
      .filter(card => card.speed != null ? card.speed <= this.filters.get('speedMax')?.value : true)
      .filter(card => card.experience != null ? card.experience >= this.filters.get('experienceMin')?.value : this.filters.get('experienceMin')?.value == 0) // only include null values if the min is 0
      .filter(card => card.experience != null ? card.experience <= this.filters.get('experienceMax')?.value : true)
      .filter(card => card.damage != null ? card.damage >= this.filters.get('damageMin')?.value : this.filters.get('damageMin')?.value == 0) // only include null values if the min is 0
      .filter(card => card.damage != null ? card.damage <= this.filters.get('damageMax')?.value : true)
      .filter(card => this.filters.get('isMultipleWeapon')?.value ? this.filters.get('isMultipleWeapon')?.value == card.multiple_weapons : true)
      .filter(card => this.filters.get('isMultipleArmor')?.value ? this.filters.get('isMultipleArmor')?.value == card.multiple_armors : true)
      .filter(card => this.filters.get('isMultipleInspiration')?.value ? this.filters.get('isMultipleInspiration')?.value == card.multiple_inspirations : true)
      .filter(card => this.filters.get('isMultipleSpecial')?.value ? this.filters.get('isMultipleSpecial')?.value == card.multiple_specials : true)
      .filter(card => this.filters.get('isReveal')?.value ? this.filters.get('isReveal')?.value == card.reveal : true)
      .filter(card => this.filters.get('isAction')?.value ? this.filters.get('isAction')?.value == card.action : true)
      .filter(card => this.filters.get('isRivalry')?.value ? this.filters.get('isRivalry')?.value == card.rivalry : true)
      .filter(card => this.filters.get('isDiscard')?.value ? this.filters.get('isDiscard')?.value == card.discards : true)
      .filter(card => this.filters.get('sets')?.value.length > 0 ? this.filters.get('sets')?.value.includes(card.set) : true)
      ;
  }

  addCardToDeck(card: Card, event: Event): void {
    event.stopPropagation();

    let firstEmptyCard: number = this.deck.findIndex(c => c.name === empty.name);
    if (firstEmptyCard >= 0) {
      this.deck.splice(firstEmptyCard, 1, card);
      this.encodeDeck(this.deck);
      this.openNotification('Added "' + card.name + '" to deck!');
      let error = this.isCardValid(card, firstEmptyCard);
      if (error) {
        this.openNotification(error);
      }
    } else {
      this.openNotification('Deck is full of cards!');
    }
  }

  removeCardFromDeck(index: number): void {
    let card: Card = this.deck[index];
    if (card.name !== 'Empty') {
      this.deck.splice(index, 1);
      this.deck.push(empty);
      this.openNotification('Removed "' + card.name + '" from deck!');
      let error = this.isDeckValid();
      if (error) {
        this.openNotification(error);
      }
    }
  }

  resetDeck(): void {
    this.deck = [empty, empty, empty, empty, empty];
    this.router.navigate(['builder']);
    this.openNotification('Deck reseted to default!');
  }

  shareDeck(): void {
    let hash = this.encodeDeck(this.deck);
    this.router.navigate(['builder'], { queryParams: { deck: hash } });
    this.openNotification('Share URL generated and copyied to clipboard!');
  }

  notEmptyCards(): number {
    return this.deck.filter(card => card.name != 'Empty').length;
  }

  drop(event: CdkDragDrop<Card[]>): void {
    moveItemInArray(this.deck, event.previousIndex, event.currentIndex);
  }

  openRules(event: MouseEvent): void {
    this.rulesRef.open(RulesComponent);
  }

  openNotification(text: string): void {
    this.snackBar.open(text, 'OK', {
      horizontalPosition: 'right',
      verticalPosition: 'top',
      duration: 4000,
      panelClass: 'datachronism-notification',
    });
  }

  isCardValid(card: Card, index: number): string|null {
    if (card.name === 'Empty') {
      return null; // to avoid red borders on empty cards
    }

    const properties: { [key: string]: { count: number; limit: number; } } = {
      warrior: { count: 0, limit: 1 },
      weapon: { count: 0, limit: 1 },
      armor: { count: 0, limit: 1 },
      inspiration: { count: 0, limit: 1 },
      special: { count: 0, limit: 1 }
    };

    for (const currentCard of this.deck.filter(c => c.name !== 'Empty')) {
      properties[currentCard.type.toLowerCase()].count++;
      properties['warrior'].limit = 1;
      properties['weapon'].limit = currentCard['multiple_weapons'] == false ? properties['weapon'].limit : 2;
      properties['armor'].limit = currentCard['multiple_armors'] == false ? properties['armor'].limit : currentCard.name == "Sainte Jeanne d'Arc" ? 3 : 2;
      properties['inspiration'].limit = currentCard['multiple_inspirations'] == false ? properties['inspiration'].limit : 2;
      properties['special'].limit = currentCard['multiple_specials'] == false ? properties['special'].limit : 2;
    }

    if (this.deck.filter(c => c.name == card.name).length > 1 && card.name !== 'Bokken') {
      return "More than 1 card with the same name!";
    }

    if (properties[card.type.toLowerCase()].count > properties[card.type.toLowerCase()].limit) {
      return "More than 1 card with the same type!";
    }

    if (card.type === 'Warrior' && index !== 0) {
      return "Warrior not in the first position!";
    }

    return null;
  }

  isDeckValid(): string|null {
    for (let i = 0; i < this.deck.length; i++) {
      let error = this.isCardValid(this.deck[i], i);
      if (error !== null) {
        return error;
      }
    }

    return null;
  }

  encodeDeck(cards: Card[]): string {
    const names: string[] = cards.map(card => card.name);
    const encodedData = btoa(JSON.stringify(names)); // encode data to Base64 string
    return encodedData;
  }

  decodeDeck(hash: string): string[] {
    const decodedData = atob(hash); // decode Base64 string to original data
    return JSON.parse(decodedData);
  }

  paginatedCards(): any[] {
    const startIndex = this.pageIndex * this.pageSize;
    return this.filteredCards().slice(startIndex, startIndex + this.pageSize);
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  openCard(card: Card): void {
    let dialogRef = this.dialog.open(CardComponent, {
      data: card,
      width: 'auto',
      maxWidth: 'none',
      height: 'auto',
      maxHeight: 'none',
    });

    dialogRef.afterClosed().subscribe((result: CardResult) => {
      if (result) {
        this.addCardToDeck(result.card, result.event);
      }
    });
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this.mobileQueryListener);
  }

}
