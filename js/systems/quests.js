const QuestSystem = {
  startQuest(saveData, questId) {
    const quest = getQuest(questId);
    if (!quest) return false;
    if (saveData.player.completedQuests.includes(questId)) return false;
    if (saveData.player.activeQuests.includes(questId)) return false;
    saveData.player.activeQuests.push(questId);
    saveData.player.questProgress[questId] = quest.objectives.map(o => ({ ...o }));
    return true;
  },

  updateQuest(saveData, questId, objectiveType, targetId, count = 1) {
    const progress = saveData.player.questProgress[questId];
    if (!progress) return false;
    let updated = false;
    for (const obj of progress) {
      if (obj.type === objectiveType && obj.target === targetId && !obj.done) {
        obj.doneCount = (obj.doneCount || 0) + count;
        if (obj.doneCount >= obj.count) {
          obj.done = true;
          updated = true;
        }
        updated = true;
      }
    }
    if (updated) this.checkCompletion(saveData, questId);
    return updated;
  },

  checkCompletion(saveData, questId) {
    const progress = saveData.player.questProgress[questId];
    if (!progress) return false;
    const allDone = progress.every(o => o.done);
    if (allDone) {
      this.completeQuest(saveData, questId);
      return true;
    }
    return false;
  },

  completeQuest(saveData, questId) {
    const quest = getQuest(questId);
    if (!quest) return;
    saveData.player.activeQuests = saveData.player.activeQuests.filter(q => q !== questId);
    saveData.player.completedQuests.push(questId);
    PlayerSystem.addXp(saveData, quest.rewards.xp);
    PlayerSystem.addGold(saveData, quest.rewards.gold);
    if (quest.rewards.item) {
      InventorySystem.addItem(saveData, quest.rewards.item, 1);
    }
    showToast(`Quest Complete: ${quest.name}! +${quest.rewards.xp} XP, +${quest.rewards.gold} Gold`, '#ffd700');
  },

  getActive(saveData) {
    return saveData.player.activeQuests.map(qId => {
      const quest = getQuest(qId);
      if (!quest) return null;
      const progress = saveData.player.questProgress[qId] || [];
      return { ...quest, objectives: progress };
    }).filter(Boolean);
  },

  getAvailable(saveData) {
    return QUEST_ARRAY.filter(q => {
      if (q.completed) return false;
      if (saveData.player.completedQuests.includes(q.id)) return false;
      if (saveData.player.activeQuests.includes(q.id)) return false;
      return true;
    });
  },

  onKill(saveData, enemyId) {
    for (const qId of saveData.player.activeQuests) {
      this.updateQuest(saveData, qId, 'kill', enemyId, 1);
    }
  },

  onCollect(saveData, itemId, qty = 1) {
    for (const qId of saveData.player.activeQuests) {
      this.updateQuest(saveData, qId, 'collect', itemId, qty);
    }
  },

  onTalk(saveData, npcId) {
    for (const qId of saveData.player.activeQuests) {
      this.updateQuest(saveData, qId, 'talk', npcId, 1);
    }
  },

  onExplore(saveData, locationId) {
    for (const qId of saveData.player.activeQuests) {
      this.updateQuest(saveData, qId, 'explore', locationId, 1);
    }
  }
};