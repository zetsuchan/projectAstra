export type TarotCard = {
  id: string;
  name: string;
  arcana: 'major' | 'minor';
  suit: string | null;
  number: number;
  meaning: { upright: string; reversed: string };
};

export const TAROT_DECK: TarotCard[] = [
  // ============================================================
  // MAJOR ARCANA (22 cards, 0-21)
  // ============================================================
  {
    id: 'major-00-fool',
    name: 'The Fool',
    arcana: 'major',
    suit: null,
    number: 0,
    meaning: {
      upright: 'New beginnings, innocence, spontaneity, and a free spirit embarking on a journey into the unknown.',
      reversed: 'Recklessness, risk-taking, and fear of the unknown holding you back from a necessary leap of faith.',
    },
  },
  {
    id: 'major-01-magician',
    name: 'The Magician',
    arcana: 'major',
    suit: null,
    number: 1,
    meaning: {
      upright: 'Manifestation, resourcefulness, and willpower channeled to transform vision into reality.',
      reversed: 'Manipulation, untapped talents, and trickery masking a lack of genuine substance.',
    },
  },
  {
    id: 'major-02-high-priestess',
    name: 'The High Priestess',
    arcana: 'major',
    suit: null,
    number: 2,
    meaning: {
      upright: 'Intuition, mystery, and deep inner knowledge waiting to surface from the subconscious.',
      reversed: 'Secrets withheld, disconnection from intuition, and surface-level understanding blocking deeper truth.',
    },
  },
  {
    id: 'major-03-empress',
    name: 'The Empress',
    arcana: 'major',
    suit: null,
    number: 3,
    meaning: {
      upright: 'Abundance, nurturing, fertility, and the sensual pleasure of life flowing freely.',
      reversed: 'Creative block, dependence on others, and neglect of self-care or personal growth.',
    },
  },
  {
    id: 'major-04-emperor',
    name: 'The Emperor',
    arcana: 'major',
    suit: null,
    number: 4,
    meaning: {
      upright: 'Authority, structure, stability, and the disciplined leadership that builds lasting foundations.',
      reversed: 'Tyranny, rigidity, and an excessive need for control that stifles growth in yourself or others.',
    },
  },
  {
    id: 'major-05-hierophant',
    name: 'The Hierophant',
    arcana: 'major',
    suit: null,
    number: 5,
    meaning: {
      upright: 'Tradition, spiritual wisdom, and conformity to established beliefs or institutions that offer guidance.',
      reversed: 'Rebellion against convention, unorthodox approaches, and questioning inherited beliefs.',
    },
  },
  {
    id: 'major-06-lovers',
    name: 'The Lovers',
    arcana: 'major',
    suit: null,
    number: 6,
    meaning: {
      upright: 'Love, harmony, meaningful relationships, and a pivotal choice guided by the heart.',
      reversed: 'Disharmony, imbalance in relationships, and misaligned values creating inner conflict.',
    },
  },
  {
    id: 'major-07-chariot',
    name: 'The Chariot',
    arcana: 'major',
    suit: null,
    number: 7,
    meaning: {
      upright: 'Determination, willpower, and triumph achieved by harnessing opposing forces toward a single goal.',
      reversed: 'Lack of direction, aggression without purpose, and losing control of competing desires.',
    },
  },
  {
    id: 'major-08-strength',
    name: 'Strength',
    arcana: 'major',
    suit: null,
    number: 8,
    meaning: {
      upright: 'Inner strength, courage, and compassionate patience that tames raw instinct with gentle resolve.',
      reversed: 'Self-doubt, weakness, and an inability to face fears or assert boundaries when needed.',
    },
  },
  {
    id: 'major-09-hermit',
    name: 'The Hermit',
    arcana: 'major',
    suit: null,
    number: 9,
    meaning: {
      upright: 'Soul-searching, introspection, and solitary contemplation that illuminates the path forward.',
      reversed: 'Isolation, loneliness, and withdrawal from the world driven by fear rather than wisdom.',
    },
  },
  {
    id: 'major-10-wheel-of-fortune',
    name: 'Wheel of Fortune',
    arcana: 'major',
    suit: null,
    number: 10,
    meaning: {
      upright: 'Destiny, turning points, and the cyclical nature of luck bringing unexpected change.',
      reversed: 'Bad luck, resistance to change, and clinging to control as cycles shift beyond your grasp.',
    },
  },
  {
    id: 'major-11-justice',
    name: 'Justice',
    arcana: 'major',
    suit: null,
    number: 11,
    meaning: {
      upright: 'Fairness, truth, accountability, and the consequences of past actions coming into balance.',
      reversed: 'Dishonesty, unfairness, and avoiding accountability for decisions that demand reckoning.',
    },
  },
  {
    id: 'major-12-hanged-man',
    name: 'The Hanged Man',
    arcana: 'major',
    suit: null,
    number: 12,
    meaning: {
      upright: 'Surrender, new perspectives, and voluntary pause that reveals wisdom through letting go.',
      reversed: 'Stalling, resistance to necessary sacrifice, and martyrdom without genuine purpose.',
    },
  },
  {
    id: 'major-13-death',
    name: 'Death',
    arcana: 'major',
    suit: null,
    number: 13,
    meaning: {
      upright: 'Endings, transformation, and the clearing away of the old to make space for profound renewal.',
      reversed: 'Resistance to inevitable change, stagnation, and fear of letting go of what no longer serves you.',
    },
  },
  {
    id: 'major-14-temperance',
    name: 'Temperance',
    arcana: 'major',
    suit: null,
    number: 14,
    meaning: {
      upright: 'Balance, moderation, and the patient blending of opposites to achieve harmony and healing.',
      reversed: 'Imbalance, excess, and a lack of long-term vision causing discord in life.',
    },
  },
  {
    id: 'major-15-devil',
    name: 'The Devil',
    arcana: 'major',
    suit: null,
    number: 15,
    meaning: {
      upright: 'Bondage, materialism, and shadow aspects of the self that chain you to destructive patterns.',
      reversed: 'Breaking free from addiction, releasing limiting beliefs, and reclaiming personal power.',
    },
  },
  {
    id: 'major-16-tower',
    name: 'The Tower',
    arcana: 'major',
    suit: null,
    number: 16,
    meaning: {
      upright: 'Sudden upheaval, destruction of false structures, and revelation that shatters illusions.',
      reversed: 'Averting disaster, fear of change, and delaying an inevitable breakdown of unstable foundations.',
    },
  },
  {
    id: 'major-17-star',
    name: 'The Star',
    arcana: 'major',
    suit: null,
    number: 17,
    meaning: {
      upright: 'Hope, inspiration, and serene faith in the future after a period of darkness and upheaval.',
      reversed: 'Despair, disconnection from purpose, and loss of faith that dims your guiding light.',
    },
  },
  {
    id: 'major-18-moon',
    name: 'The Moon',
    arcana: 'major',
    suit: null,
    number: 18,
    meaning: {
      upright: 'Illusion, fear, anxiety, and the subconscious mind revealing hidden truths through dreams and intuition.',
      reversed: 'Release of fear, clarity emerging from confusion, and repressed emotions finally surfacing.',
    },
  },
  {
    id: 'major-19-sun',
    name: 'The Sun',
    arcana: 'major',
    suit: null,
    number: 19,
    meaning: {
      upright: 'Joy, success, vitality, and the radiant warmth of clarity illuminating every aspect of life.',
      reversed: 'Temporary sadness, lack of enthusiasm, and an inner child dimmed by overly serious circumstances.',
    },
  },
  {
    id: 'major-20-judgement',
    name: 'Judgement',
    arcana: 'major',
    suit: null,
    number: 20,
    meaning: {
      upright: 'Rebirth, inner calling, and a moment of reckoning that demands you rise to your highest self.',
      reversed: 'Self-doubt, refusal of a calling, and harsh self-judgment that blocks spiritual awakening.',
    },
  },
  {
    id: 'major-21-world',
    name: 'The World',
    arcana: 'major',
    suit: null,
    number: 21,
    meaning: {
      upright: 'Completion, accomplishment, and wholeness as a grand cycle reaches its fulfilling conclusion.',
      reversed: 'Incompletion, shortcuts taken, and a lack of closure preventing you from moving to the next chapter.',
    },
  },

  // ============================================================
  // MINOR ARCANA — WANDS (14 cards)
  // ============================================================
  {
    id: 'minor-wands-01-ace',
    name: 'Ace of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 1,
    meaning: {
      upright: 'A spark of inspiration, new creative potential, and the bold beginning of a passionate venture.',
      reversed: 'Delays, lack of motivation, and a creative idea that struggles to find its ignition.',
    },
  },
  {
    id: 'minor-wands-02-two',
    name: 'Two of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 2,
    meaning: {
      upright: 'Planning, future vision, and the restless energy of deciding between staying safe and venturing forward.',
      reversed: 'Fear of the unknown, lack of planning, and playing it too safe when boldness is required.',
    },
  },
  {
    id: 'minor-wands-03-three',
    name: 'Three of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 3,
    meaning: {
      upright: 'Expansion, foresight, and early results arriving as your plans begin to take shape on the horizon.',
      reversed: 'Obstacles to progress, lack of foresight, and frustration from delays in long-term plans.',
    },
  },
  {
    id: 'minor-wands-04-four',
    name: 'Four of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 4,
    meaning: {
      upright: 'Celebration, harmony, homecoming, and a joyful milestone marking stability and community.',
      reversed: 'Lack of harmony, cancelled celebrations, and feeling unwelcome or unsettled in your environment.',
    },
  },
  {
    id: 'minor-wands-05-five',
    name: 'Five of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 5,
    meaning: {
      upright: 'Competition, conflict, and the heated clash of egos each vying for dominance and recognition.',
      reversed: 'Avoiding conflict, finding common ground, and the resolution of petty disputes.',
    },
  },
  {
    id: 'minor-wands-06-six',
    name: 'Six of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 6,
    meaning: {
      upright: 'Victory, public recognition, and the triumphant confidence that comes from achieving your goals.',
      reversed: 'Fall from grace, ego, and hollow victories that bring attention but not genuine fulfillment.',
    },
  },
  {
    id: 'minor-wands-07-seven',
    name: 'Seven of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 7,
    meaning: {
      upright: 'Defensiveness, standing your ground, and the perseverance needed to protect what you have built.',
      reversed: 'Feeling overwhelmed, giving up too easily, and exhaustion from constant battles on every front.',
    },
  },
  {
    id: 'minor-wands-08-eight',
    name: 'Eight of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 8,
    meaning: {
      upright: 'Swift action, rapid progress, and exciting momentum propelling events forward at great speed.',
      reversed: 'Delays, frustration with slow progress, and scattered energy that dissipates before reaching its target.',
    },
  },
  {
    id: 'minor-wands-09-nine',
    name: 'Nine of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 9,
    meaning: {
      upright: 'Resilience, persistence, and the weary courage to keep going despite wounds from past struggles.',
      reversed: 'Exhaustion, paranoia, and stubbornly refusing help when you are too battered to continue alone.',
    },
  },
  {
    id: 'minor-wands-10-ten',
    name: 'Ten of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 10,
    meaning: {
      upright: 'Burden, responsibility, and the heavy weight of carrying too many obligations without delegation.',
      reversed: 'Letting go of burdens, learning to delegate, and releasing responsibilities that are not truly yours.',
    },
  },
  {
    id: 'minor-wands-11-page',
    name: 'Page of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 11,
    meaning: {
      upright: 'Enthusiasm, exploration, and a free-spirited messenger bringing news of creative opportunity.',
      reversed: 'Lack of direction, hasty decisions, and a scattered mind unable to commit to any single spark.',
    },
  },
  {
    id: 'minor-wands-12-knight',
    name: 'Knight of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 12,
    meaning: {
      upright: 'Energy, passion, adventure, and a fearless charge toward a goal with infectious enthusiasm.',
      reversed: 'Impulsiveness, recklessness, and burning bridges through haste and a volatile temper.',
    },
  },
  {
    id: 'minor-wands-13-queen',
    name: 'Queen of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 13,
    meaning: {
      upright: 'Confidence, warmth, determination, and a magnetic presence that inspires loyalty and action.',
      reversed: 'Jealousy, selfishness, and demanding attention at the expense of genuine connection.',
    },
  },
  {
    id: 'minor-wands-14-king',
    name: 'King of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 14,
    meaning: {
      upright: 'Visionary leadership, bold entrepreneurship, and the charisma to turn ambitious ideas into reality.',
      reversed: 'Impulsiveness, overbearing authority, and a dictatorial leader whose vision overshadows collaboration.',
    },
  },

  // ============================================================
  // MINOR ARCANA — CUPS (14 cards)
  // ============================================================
  {
    id: 'minor-cups-01-ace',
    name: 'Ace of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 1,
    meaning: {
      upright: 'New love, emotional awakening, and the overflowing beginning of deep compassion and connection.',
      reversed: 'Emotional loss, blocked feelings, and a heart closed off from giving or receiving love.',
    },
  },
  {
    id: 'minor-cups-02-two',
    name: 'Two of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 2,
    meaning: {
      upright: 'Partnership, mutual attraction, and a unified bond built on equal respect and shared feeling.',
      reversed: 'Imbalance in a relationship, broken trust, and miscommunication eroding a once-strong connection.',
    },
  },
  {
    id: 'minor-cups-03-three',
    name: 'Three of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 3,
    meaning: {
      upright: 'Friendship, celebration, and joyful gatherings that uplift the spirit through shared happiness.',
      reversed: 'Overindulgence, gossip, and social drama undermining the bonds of friendship.',
    },
  },
  {
    id: 'minor-cups-04-four',
    name: 'Four of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 4,
    meaning: {
      upright: 'Apathy, contemplation, and emotional withdrawal that causes you to overlook opportunities before you.',
      reversed: 'Renewed interest, acceptance of new offerings, and emerging from a period of emotional stagnation.',
    },
  },
  {
    id: 'minor-cups-05-five',
    name: 'Five of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 5,
    meaning: {
      upright: 'Loss, grief, and dwelling on what has been spilled while ignoring what still stands upright.',
      reversed: 'Acceptance, moving on, and finding the strength to shift focus from loss to remaining blessings.',
    },
  },
  {
    id: 'minor-cups-06-six',
    name: 'Six of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 6,
    meaning: {
      upright: 'Nostalgia, childhood memories, and the innocent sweetness of revisiting the past with warmth.',
      reversed: 'Living in the past, unrealistic nostalgia, and clinging to memories that prevent present growth.',
    },
  },
  {
    id: 'minor-cups-07-seven',
    name: 'Seven of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 7,
    meaning: {
      upright: 'Fantasy, illusion, and a dazzling array of choices that can lead to wishful thinking over action.',
      reversed: 'Clarity of purpose, making a choice, and grounding fantasies into achievable reality.',
    },
  },
  {
    id: 'minor-cups-08-eight',
    name: 'Eight of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 8,
    meaning: {
      upright: 'Walking away, disillusionment, and the courageous decision to leave behind what no longer fulfills you.',
      reversed: 'Fear of change, aimless drifting, and clinging to a situation despite knowing it is empty.',
    },
  },
  {
    id: 'minor-cups-09-nine',
    name: 'Nine of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 9,
    meaning: {
      upright: 'Contentment, emotional satisfaction, and the fulfillment of a heartfelt wish coming true.',
      reversed: 'Dissatisfaction despite outward success, greed, and seeking happiness in superficial pleasures.',
    },
  },
  {
    id: 'minor-cups-10-ten',
    name: 'Ten of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 10,
    meaning: {
      upright: 'Emotional fulfillment, family harmony, and the lasting joy of deep, loving relationships.',
      reversed: 'Broken family bonds, disharmony at home, and shattered expectations of domestic bliss.',
    },
  },
  {
    id: 'minor-cups-11-page',
    name: 'Page of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 11,
    meaning: {
      upright: 'Creative inspiration, intuitive messages, and a youthful spirit open to emotional discovery.',
      reversed: 'Emotional immaturity, creative blocks, and escapism into fantasy to avoid genuine feeling.',
    },
  },
  {
    id: 'minor-cups-12-knight',
    name: 'Knight of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 12,
    meaning: {
      upright: 'Romance, charm, and a dreamy idealist who follows the heart with poetic devotion.',
      reversed: 'Moodiness, unrealistic expectations, and a charming facade hiding emotional unreliability.',
    },
  },
  {
    id: 'minor-cups-13-queen',
    name: 'Queen of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 13,
    meaning: {
      upright: 'Compassion, emotional depth, and nurturing intuition that sees and heals the pain of others.',
      reversed: 'Emotional insecurity, codependency, and losing yourself in the needs of those around you.',
    },
  },
  {
    id: 'minor-cups-14-king',
    name: 'King of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 14,
    meaning: {
      upright: 'Emotional maturity, diplomatic wisdom, and mastery of feelings expressed with calm authority.',
      reversed: 'Emotional manipulation, moodiness, and a volatile temperament hidden beneath a composed exterior.',
    },
  },

  // ============================================================
  // MINOR ARCANA — SWORDS (14 cards)
  // ============================================================
  {
    id: 'minor-swords-01-ace',
    name: 'Ace of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 1,
    meaning: {
      upright: 'Mental clarity, breakthrough, and a powerful new idea cutting through confusion with sharp truth.',
      reversed: 'Confusion, miscommunication, and a truth wielded recklessly or suppressed out of fear.',
    },
  },
  {
    id: 'minor-swords-02-two',
    name: 'Two of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 2,
    meaning: {
      upright: 'Indecision, stalemate, and a difficult choice requiring you to remove the blindfold and face the truth.',
      reversed: 'Information overload, avoidance, and being forced into a decision you have been putting off.',
    },
  },
  {
    id: 'minor-swords-03-three',
    name: 'Three of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 3,
    meaning: {
      upright: 'Heartbreak, sorrow, and the piercing pain of betrayal or emotional loss that demands grieving.',
      reversed: 'Recovery from grief, forgiveness, and the slow process of releasing deep emotional pain.',
    },
  },
  {
    id: 'minor-swords-04-four',
    name: 'Four of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 4,
    meaning: {
      upright: 'Rest, recovery, and a necessary retreat to restore mental and physical energy before continuing.',
      reversed: 'Restlessness, burnout, and refusing the rest your body and mind desperately need.',
    },
  },
  {
    id: 'minor-swords-05-five',
    name: 'Five of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 5,
    meaning: {
      upright: 'Conflict, defeat, and a hollow victory won at the cost of broken trust and damaged relationships.',
      reversed: 'Reconciliation, moving past conflict, and choosing peace over the need to be right.',
    },
  },
  {
    id: 'minor-swords-06-six',
    name: 'Six of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 6,
    meaning: {
      upright: 'Transition, moving on, and the quiet journey from turbulent waters toward calmer shores.',
      reversed: 'Emotional baggage, resistance to moving on, and unresolved issues weighing down your passage.',
    },
  },
  {
    id: 'minor-swords-07-seven',
    name: 'Seven of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 7,
    meaning: {
      upright: 'Deception, strategy, and the cunning act of getting away with something through stealth.',
      reversed: 'Coming clean, conscience catching up, and secrets exposed that can no longer be hidden.',
    },
  },
  {
    id: 'minor-swords-08-eight',
    name: 'Eight of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 8,
    meaning: {
      upright: 'Feeling trapped, self-imposed restriction, and mental imprisonment by beliefs that are not real barriers.',
      reversed: 'Self-liberation, new perspective, and realizing the constraints binding you were of your own making.',
    },
  },
  {
    id: 'minor-swords-09-nine',
    name: 'Nine of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 9,
    meaning: {
      upright: 'Anxiety, nightmares, and the anguish of worst-case thoughts spiraling in the dark of night.',
      reversed: 'Hope after despair, releasing worry, and learning to quiet the mind after prolonged anxiety.',
    },
  },
  {
    id: 'minor-swords-10-ten',
    name: 'Ten of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 10,
    meaning: {
      upright: 'Rock bottom, painful ending, and the dramatic conclusion of a cycle that has run its painful course.',
      reversed: 'Recovery, resilience, and the first light of dawn after the darkest possible night.',
    },
  },
  {
    id: 'minor-swords-11-page',
    name: 'Page of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 11,
    meaning: {
      upright: 'Curiosity, mental agility, and a sharp young mind eager to uncover truth and share new ideas.',
      reversed: 'Gossip, cynicism, and using intellect to cut others down rather than to seek genuine understanding.',
    },
  },
  {
    id: 'minor-swords-12-knight',
    name: 'Knight of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 12,
    meaning: {
      upright: 'Ambition, fast action, and a driven mind charging headlong toward its goal with fierce determination.',
      reversed: 'Reckless haste, aggression, and a sharp tongue that wounds before thinking of consequences.',
    },
  },
  {
    id: 'minor-swords-13-queen',
    name: 'Queen of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 13,
    meaning: {
      upright: 'Clear boundaries, honest communication, and an independent mind that speaks truth with grace.',
      reversed: 'Cold-heartedness, bitterness, and using sharp intellect as a weapon to keep others at a distance.',
    },
  },
  {
    id: 'minor-swords-14-king',
    name: 'King of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 14,
    meaning: {
      upright: 'Intellectual authority, clear thinking, and ethical leadership guided by logic and impartial truth.',
      reversed: 'Abuse of power, manipulation through intellect, and cold judgment devoid of empathy.',
    },
  },

  // ============================================================
  // MINOR ARCANA — PENTACLES (14 cards)
  // ============================================================
  {
    id: 'minor-pentacles-01-ace',
    name: 'Ace of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 1,
    meaning: {
      upright: 'New financial opportunity, prosperity, and the tangible seed of material abundance taking root.',
      reversed: 'Missed opportunity, poor planning, and a promising venture that fails to materialize.',
    },
  },
  {
    id: 'minor-pentacles-02-two',
    name: 'Two of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 2,
    meaning: {
      upright: 'Balance, adaptability, and the juggling act required to manage competing priorities with grace.',
      reversed: 'Overwhelm, financial disorganization, and dropping the ball from taking on too much at once.',
    },
  },
  {
    id: 'minor-pentacles-03-three',
    name: 'Three of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 3,
    meaning: {
      upright: 'Teamwork, skilled craftsmanship, and collaborative effort producing work of lasting quality.',
      reversed: 'Lack of teamwork, poor quality, and disregard for the expertise needed to do the job well.',
    },
  },
  {
    id: 'minor-pentacles-04-four',
    name: 'Four of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 4,
    meaning: {
      upright: 'Security, conservation, and holding tightly to what you have earned out of a need for stability.',
      reversed: 'Greed, materialism, and hoarding resources from a fear of loss that blocks generosity.',
    },
  },
  {
    id: 'minor-pentacles-05-five',
    name: 'Five of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 5,
    meaning: {
      upright: 'Financial loss, poverty, and the feeling of being left out in the cold without support.',
      reversed: 'Recovery from hardship, finding help, and spiritual wealth emerging despite material lack.',
    },
  },
  {
    id: 'minor-pentacles-06-six',
    name: 'Six of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 6,
    meaning: {
      upright: 'Generosity, charity, and the balanced flow of giving and receiving that creates shared prosperity.',
      reversed: 'Strings attached to gifts, inequality, and generosity used as a tool for power and control.',
    },
  },
  {
    id: 'minor-pentacles-07-seven',
    name: 'Seven of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 7,
    meaning: {
      upright: 'Patience, long-term investment, and pausing to assess whether your hard work is bearing fruit.',
      reversed: 'Impatience, wasted effort, and frustration from a harvest that has not met expectations.',
    },
  },
  {
    id: 'minor-pentacles-08-eight',
    name: 'Eight of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 8,
    meaning: {
      upright: 'Diligence, mastery, and the dedicated practice of a skill refined through repetition and focus.',
      reversed: 'Perfectionism, lack of motivation, and tedious work that has lost its sense of purpose.',
    },
  },
  {
    id: 'minor-pentacles-09-nine',
    name: 'Nine of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 9,
    meaning: {
      upright: 'Luxury, self-sufficiency, and the elegant reward of disciplined effort enjoyed in comfortable independence.',
      reversed: 'Overinvestment in work, financial setbacks, and questioning whether material success has cost too much.',
    },
  },
  {
    id: 'minor-pentacles-10-ten',
    name: 'Ten of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 10,
    meaning: {
      upright: 'Legacy, inheritance, and lasting wealth built across generations through family and tradition.',
      reversed: 'Family disputes over money, fleeting success, and the instability of wealth without solid roots.',
    },
  },
  {
    id: 'minor-pentacles-11-page',
    name: 'Page of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 11,
    meaning: {
      upright: 'Ambition, new study, and an eager student laying the groundwork for future material success.',
      reversed: 'Lack of progress, procrastination, and grand plans that never move beyond the dreaming stage.',
    },
  },
  {
    id: 'minor-pentacles-12-knight',
    name: 'Knight of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 12,
    meaning: {
      upright: 'Hard work, reliability, and a methodical approach that builds results through steady, patient effort.',
      reversed: 'Stubbornness, stagnation, and perfectionism that grinds progress to a frustrating halt.',
    },
  },
  {
    id: 'minor-pentacles-13-queen',
    name: 'Queen of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 13,
    meaning: {
      upright: 'Nurturing abundance, practical wisdom, and a warm provider who creates comfort and security for all.',
      reversed: 'Neglecting self-care, smothering, and tying self-worth entirely to material accomplishments.',
    },
  },
  {
    id: 'minor-pentacles-14-king',
    name: 'King of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 14,
    meaning: {
      upright: 'Wealth, business acumen, and the disciplined stewardship of resources that creates enduring prosperity.',
      reversed: 'Greed, financial mismanagement, and valuing wealth and status above all human connection.',
    },
  },
];

export const TAROT_DECK_MAP = new Map(TAROT_DECK.map((c) => [c.id, c]));
