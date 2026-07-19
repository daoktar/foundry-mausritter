// Typed data models replacing loose template.json data. Unknown keys written to
// `system` are now dropped instead of persisted. Field defaults mirror template.json.
const fields = foundry.data.fields;

// ponytail: numbers stay nullable/unconstrained — goal is schema shape, not value validation
const num = (initial = 0) => new fields.NumberField({ required: true, nullable: true, initial });
const str = (initial = "") => new fields.StringField({ required: true, initial });
const bool = (initial = false) => new fields.BooleanField({ required: true, initial });

const statField = (label) => new fields.SchemaField({
  value: num(0),
  max: num(0),
  label: str(label)
});

const statsSchema = () => new fields.SchemaField({
  strength: statField("Strength"),
  dexterity: statField("Dexterity"),
  will: statField("Will")
});

const actorBase = () => ({
  health: new fields.SchemaField({ value: num(0), min: num(0), max: num(0) }),
  hits: new fields.SchemaField({ value: num(2), max: num(2) }),
  armor: num(0),
  biography: new fields.HTMLField({ required: true, initial: "" }),
  notes: new fields.HTMLField({ required: true, initial: "" })
});

export class CharacterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...actorBase(),
      description: new fields.SchemaField({
        background: str("Description"),
        birthsign: str(),
        coat: str(),
        look: str()
      }),
      level: new fields.SchemaField({ value: num(1), xp: num(0) }),
      pips: new fields.SchemaField({ value: num(0) }),
      grit: new fields.SchemaField({ value: num(0), ignored: str() }),
      stats: statsSchema(),
      other: new fields.SchemaField({
        grit: new fields.SchemaField({ value: num(0) })
      })
    };
  }
}

export class NpcData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...actorBase(),
      description: new fields.SchemaField({ disposition: str() }),
      stats: statsSchema()
    };
  }
}

export class StorageActorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...actorBase(),
      description: new fields.SchemaField({ disposition: str() }),
      size: new fields.SchemaField({ width: num(3), height: num(2) }),
      storeDiv: str()
    };
  }
}

const itemBase = () => ({
  description: new fields.HTMLField({ required: true, initial: "" }),
  sheet: new fields.SchemaField({
    active: bool(),
    currentX: num(0),
    currentY: num(0),
    initialX: num(0),
    initialY: num(0),
    xOffset: num(0),
    yOffset: num(0),
    rotation: num(0),
    curWidth: num(1),
    curHeight: num(1),
    zIndex: num(1)
  }),
  pips: new fields.SchemaField({ value: num(0), max: num(0), html: str() }),
  size: new fields.SchemaField({
    width: num(1),
    height: num(1),
    x: str("9em"),
    y: str("9em"),
    aspect: num(1)
  }),
  // not in template.json but persisted by the item-equip listeners
  equipped: bool(),
  color: str("white"),
  tag: str()
});

export class ItemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...itemBase(),
      weight: num(0),
      cost: num(0),
      placement: str("hand")
    };
  }
}

export class WeaponData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...itemBase(),
      weight: num(0),
      cost: num(0),
      placement: str("hand"),
      weapon: new fields.SchemaField({
        dmg1: str("d6"),
        dmg2: str(),
        selected: num(0),
        canSwap: bool()
      })
    };
  }
}

export class ArmorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...itemBase(),
      weight: num(0),
      cost: num(0),
      armor: new fields.SchemaField({ value: num(1) })
    };
  }
}

export class StorageItemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...itemBase(),
      weight: num(0),
      cost: num(0),
      // template.json stores this as a string ("0"); sheets rely on it
      store: new fields.SchemaField({ value: str("0"), max: num(25) })
    };
  }
}

export class ConditionData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...itemBase(),
      clear: str(),
      desc: str()
    };
  }
}

export class SpellData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...itemBase(),
      isSpell: bool(true)
    };
  }
}

export function registerDataModels() {
  CONFIG.Actor.dataModels = {
    character: CharacterData,
    hireling: NpcData,
    creature: NpcData,
    storage: StorageActorData
  };
  CONFIG.Item.dataModels = {
    item: ItemData,
    weapon: WeaponData,
    armor: ArmorData,
    storage: StorageItemData,
    condition: ConditionData,
    spell: SpellData
  };
}
