# 1. Mérföldkő

## UI - Felhasználói felület

A felhasználói felület a következő technológiákon alapszik:

- Alap oldalak: HTML, CSS, JavaScript, TypeScript, React, NextJS
- Szerkesztő felület: Canvas, KonvaJS

A felhasználói felület a következő oldalakból áll:

- Főoldal: A felhasználó köszöntése, kezdő lépések felajánlása
- Autentikációs oldalak: Bejelentkezés, regisztráció
- Felhasználói profil: Adatok áttekintése, szerkesztése
- Saját projektek: Korábban létrehozott és lementett projektek listázása
- Új projekt: Sablonok, szűrők, kereső funkciók
- Szerkesztő: Az aktuális projekt szerkesztése, a webapp fő része
- Felhasználók közötti kommunikációs oldal: A sablon tulajdonos és az alap felhasználók közötti kommunikáció
- Értesítések: Új üzenetek, TBD
- Admin felület: Felhasználók kezelése, projektek kezelése, debug funkciók

Oldaltérkép:

```mermaid
graph TD;
    Főoldal <--> Bejelentkezés
    Főoldal <--> Regisztráció
    Főoldal --> Saját_projektek

    Bejelentkezés <--> Regisztráció
    Bejelentkezés --> Saját_projektek
    Regisztráció --> Saját_projektek
    
    Saját_projektek <--> Új_projekt
    Saját_projektek <--> Szerkesztő
    Saját_projektek <--> Értesítések
    Saját_projektek <--> Felhasználói_profil
    Saját_projektek <--> Admin_felület
    Saját_projektek <--> Kommunikációs_oldal
    
    Új_projekt --> Szerkesztő
    Értesítések <--> Kommunikációs_oldal
    Szerkesztő <--> Kommunikációs_oldal
```

## DB - Adatbázis

Az adatbázis PostgreSQL-t használ Drizzle ORM-el, a következő táblákkal és kapcsolatokkal:

```mermaid
erDiagram
    FELHASZNALOK {
        INT id
        VARCHAR nev
        VARCHAR email
        VARCHAR jelszo
        DATE regisztracio_datuma
    }
    SABLONOK {
        INT id
        INT tulajdonos_id
        INT file_id
        VARCHAR nev
        VARCHAR leiras
        DATE letrehozas_datuma
    }
    PROJEKTEK {
        INT id
        INT sablon_id
        INT tulajdonos_id
        INT file_id
        VARCHAR nev
        DATE letrehozas_datuma
        DATE utolso_modositas_datuma
    }
    UZENETEK {
        INT id
        INT kuldo_id
        INT cimzett_id
        INT projekt_id
        VARCHAR uzenet
        DATE elkuldese_datuma
    }
    SABLON_SZUROK {
        INT id
        INT sablon_id
        VARCHAR megnvezes
        VARCHAR kategoria
    }
    SABLON_SZUROK_KAPCSOLAT {
        INT sablon_id
        INT szuro_id
    }
    FILE {
        INT id
        VARCHAR nev
        VARCHAR eleresi_ut
    }
    FILE ||--o{ SABLONOK : "file_id"
    FILE ||--o{ PROJEKTEK : "file_id"
    SABLONOK ||--o{ SABLON_SZUROK_KAPCSOLAT : "sablon_id"
    SABLON_SZUROK ||--o{ SABLON_SZUROK_KAPCSOLAT : "szuro_id"
    FELHASZNALOK ||--o{ PROJEKTEK : "tulajdonos_id"
    FELHASZNALOK ||--o{ SABLONOK : "tulajdonos_id"
    SABLONOK ||--o{ PROJEKTEK : "sablon_id"
    FELHASZNALOK ||--o{ UZENETEK : "kuldo_id"
    FELHASZNALOK ||--o{ UZENETEK : "cimzett_id"
```

**Kapcsolatok:**
- Egy felhasználó több projekttel/sablonnal rendelkezhet
- Minden projekt egy sablonból indul ki, így több projekt is tartozhat egy sablonhoz
- Egy felhasználó több üzenetet küldhet és fogadhat
- Egy sablon több szűrővel rendelkezhet, egy szűrő több sablonhoz is tartozhat
- A fájlok külön táblában vannak tárolva, így egy fájl több projekthez is tartozhat (nincs szükség duplikációra módosítatlan sablonok esetén)


## BL - Üzleti logika

A használt technológiák nem objektumorientáltak, így a BL réteg nem osztályokban, hanem függvényekben és funkcionális komponensekben lesz megvalósítva.

**Fontosabb objektumok és műveleteik:**

- Felhasználó: CRUD műveletek, bejelentkezés, regisztráció, jelszóváltoztatás
- Sablon: CRUD műveletek, szűrés, keresés
- Projekt: CRUD műveletek, megosztás
- Üzenet: CR műveletek, küldés, fogadás
- Fájl: CRUD műveletek, exportálás, importálás
- Szűrő: CRUD műveletek, sablonokhoz rendelés
