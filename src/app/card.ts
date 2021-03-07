import { Game } from './table'

export class Card {

    private static values = [0, 11 /* 1 = As */, 0, 0, 0, 0, 0, 0, 0, 0, 10, 2 /* 11 = Bube */, 3 /* 12 = Dame */, 4 /* 13 = King */];

    public static getDenomination(card: number): number {
        return (card & 15); // 1 = As, 2 = 2, 3 = 3 ... 10 = 10, 11 = Bube, 12 = Dame, 13 = King
    }
    public static getColor(card: number): number {
        return (card & (0x70) / 16);  // 1 = Karo, 2 = Herz, 3 = Pik, 4 = Kreuz
    }
    public static isPlayed(card: number): boolean {
        return ((card & (0x100)) != 0); // signifies card is already played
    }
    public static getValue(card: number): number {
        if (card > 0 && card < 14 )
        {
            return this.values[card];
        }
        return 0;
    }

    public static getSortValue(game: Game, card_in: number): number {
        let card = card_in + 0;
        let isBDSolo = (game == Game.BubenSolo || game == Game.DamenSolo);
        if (card == 10 + Card.Heart && !isBDSolo)
        {
            return 1000;
        }
        if ( (card & 15) == 1)
        {
            card += 14;  // ass is higher than king
        }
        else if ( (card & 15) == 10)
        {
            card += 4;  // 10 is higher than king
        }
        if (game != Game.BubenSolo && (card & 15) == 12 /* Dame */)
        {
            return card + 256   ;
        }
        else if (game != Game.DamenSolo && (card & 15) == 11 /* Bube */)
        {
            return card + 128;
        }
        else if (!isBDSolo && (card & 0x70) == Card.Diamonds)
        {
            // Diamond is trump
            return card + 64;
        }
        return card;
    }

    
    public static isTrump(game: Game, card_in: number): boolean {
        let isBDSolo = (game == Game.BubenSolo || game == Game.DamenSolo);

        return ( (card_in == 10 + Card.Heart && !isBDSolo)
            || ( ((card_in & 15) == 12) && game != Game.BubenSolo)
            || ( ((card_in & 15) == 11) && game != Game.DamenSolo)
            || ( ((card_in & 0x70) == Card.Diamonds) && !isBDSolo) );
        }
      
    public static   getCardAsImage(card: number): string {
        let color = ((card & 0x70) == Card.Diamonds ? "diamonds" : (
                     (card & 0x70) == Card.Heart ? "hearts" : (
                     (card & 0x70) == Card.Spade ? "spades" : "clubs"
                     )));
    
        return "assets/" + color + (card & 15).toString() + ".png"
    //    return OwncardsComponent.colorStrings[((card & (7*16)) / 16)] + OwncardsComponent.valueStrings[card&15];
      }
    
  

    public static Diamonds = 16 | 0;
    public static Heart    = 32 | 0;
    public static Spade    = 48 | 0;
    public static Clubs    = 64 | 0;

}