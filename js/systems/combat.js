const CombatSystem = {
  enterCombat(saveData, enemyId) {
    const enemyDef = getEnemy(enemyId);
    if (!enemyDef) return null;
    const enemy = {
      ...enemyDef,
      currentHp: enemyDef.hp,
      maxHp: enemyDef.hp,
      currentPhase: 0,
      turnCount: 0,
      buffs: [],
      debuffs: []
    };
    if (enemy.isBoss) {
      const scaledHp = Math.floor(enemy.hp * (1 + (saveData.player.level - 1) * 0.1));
      enemy.currentHp = scaledHp;
      enemy.maxHp = scaledHp;
    }
    return enemy;
  },

  playerAttack(saveData, enemy) {
    const atk = PlayerSystem.getTotalAtk(saveData);
    const variance = rand(80, 120);
    const damage = Math.max(1, Math.floor(atk * variance / 100));
    enemy.currentHp -= damage;
    return { damage, type: 'physical' };
  },

  playerSpell(saveData, enemy, spellId) {
    const result = PlayerSystem.castSpell(saveData, spellId);
    if (!result) return null;
    const { spell, damage } = result;
    let finalDamage = damage;
    const weakness = getWeakness(enemy.id, spell.type);
    if (weakness > 0) finalDamage = Math.floor(damage * (1 + weakness * 0.5));
    enemy.currentHp -= finalDamage;
    if (spell.effect === 'heal') {
      PlayerSystem.heal(saveData, Math.abs(spell.damage));
      return { damage: -Math.abs(spell.damage), type: 'heal', spell };
    }
    if (spell.effect === 'shield') {
      saveData.player.shield = Math.floor(PlayerSystem.getTotalMatk(saveData) * 0.5) + 10;
    }
    return { damage: finalDamage, type: spell.type, spell };
  },

  enemyTurn(saveData, enemy) {
    enemy.turnCount++;
    if (enemy.isBoss && enemy.phases) {
      const hpPct = enemy.currentHp / enemy.maxHp;
      for (let i = enemy.phases.length - 1; i >= 0; i--) {
        if (hpPct <= enemy.phases[i].hpPct && i >= enemy.currentPhase) {
          enemy.currentPhase = i;
          break;
        }
      }
    }
    const atk = enemy.currentPhase >= 0 && enemy.phases ? enemy.phases[enemy.currentPhase].atk : enemy.atk;
    const variance = rand(85, 115);
    const playerDef = PlayerSystem.getTotalDef(saveData);
    const rawDamage = Math.floor(atk * variance / 100);
    let damage = Math.max(1, Math.floor(rawDamage * (100 / (100 + playerDef))));
    const shield = saveData.player.shield || 0;
    if (shield > 0) {
      const blocked = Math.min(shield, damage);
      damage -= blocked;
      saveData.player.shield = shield - blocked;
    }
    const isDead = PlayerSystem.takeDamage(saveData, damage);
    return { damage, isDead };
  },

  playerDefend(saveData) {
    saveData.player.defending = true;
    saveData.player.shield = (saveData.player.shield || 0) + Math.floor(PlayerSystem.getTotalDef(saveData) * 0.3);
    return true;
  },

  getLoot(saveData, enemy) {
    const loot = [];
    if (enemy.drops) {
      for (const drop of enemy.drops) {
        if (Math.random() < drop.chance) {
          loot.push({ id: drop.id, qty: 1 });
        }
      }
    }
    const goldBonus = enemy.gold + rand(0, Math.floor(enemy.gold * 0.5));
    saveData.player.gold += goldBonus;
    for (const l of loot) {
      InventorySystem.addItem(saveData, l.id, l.qty);
    }
    PlayerSystem.addXp(saveData, enemy.xp);
    PlayerSystem.killEnemy(saveData, enemy.id);
    return { xp: enemy.xp, gold: goldBonus, loot, leveled: false };
  },

  checkLevelUp(saveData) {
    return PlayerSystem.addXp(saveData, 0);
  }
};

function getWeakness(enemyId, spellType) {
  const weaknesses = {
    fire_elemental: { ice: 1.5, water: 1.5 },
    frost_wraith: { fire: 1.5 },
    rock_golem: { earth: 0.5, lightning: 1.3 },
    thunder_bird: { earth: 1.5 },
    boss_wyrm: { ice: 1.3, lightning: 1.3 },
    boss_lich: { fire: 1.5, arcane: 1.5 },
    boss_phoenix: { ice: 2.0, water: 2.0 },
    shadow_knight: { fire: 1.3, arcane: 1.3 },
    crystal_guardian: { earth: 1.5, lightning: 0.5 },
    magma_beast: { ice: 1.5, water: 1.5 },
  };
  const w = weaknesses[enemyId];
  if (w && w[spellType]) return w[spellType];
  return 1;
}