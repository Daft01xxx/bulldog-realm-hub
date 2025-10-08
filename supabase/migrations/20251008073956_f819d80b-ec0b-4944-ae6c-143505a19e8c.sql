-- Add recovery phrase and session management fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS recovery_phrase TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS active_sessions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS second_ip_address INET;

-- Create index for recovery phrase lookups
CREATE INDEX IF NOT EXISTS idx_profiles_recovery_phrase ON public.profiles(recovery_phrase);

-- Function to generate unique recovery phrase (20 random English words)
CREATE OR REPLACE FUNCTION generate_recovery_phrase()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    words TEXT[] := ARRAY[
        'ability', 'absence', 'academy', 'account', 'achieve', 'acquire', 'address', 'advance', 'advice', 'affect',
        'afford', 'agency', 'agenda', 'agent', 'agree', 'airport', 'album', 'alert', 'allow', 'almost',
        'alone', 'already', 'amount', 'ancient', 'angle', 'angry', 'animal', 'announce', 'annual', 'answer',
        'anxiety', 'anybody', 'appeal', 'appear', 'apple', 'apply', 'approach', 'approve', 'argue', 'arise',
        'army', 'around', 'arrange', 'arrest', 'arrive', 'article', 'artist', 'aspect', 'assault', 'assert',
        'assess', 'asset', 'assign', 'assist', 'assume', 'assure', 'attach', 'attack', 'attempt', 'attend',
        'attitude', 'attract', 'author', 'average', 'avoid', 'award', 'aware', 'balance', 'barrel', 'barrier',
        'basic', 'basket', 'battle', 'beach', 'beauty', 'become', 'before', 'begin', 'behalf', 'behave',
        'behind', 'being', 'belief', 'belong', 'below', 'bench', 'benefit', 'beside', 'better', 'between',
        'beyond', 'bishop', 'bitter', 'black', 'blame', 'blank', 'blind', 'block', 'blood', 'board',
        'border', 'bottle', 'bottom', 'boundary', 'brain', 'branch', 'brand', 'brave', 'bread', 'break',
        'breath', 'bridge', 'brief', 'bright', 'bring', 'broad', 'brother', 'brown', 'budget', 'build',
        'bullet', 'burden', 'bureau', 'button', 'cabinet', 'camera', 'camp', 'campaign', 'campus', 'cancer',
        'candidate', 'capable', 'capacity', 'capital', 'captain', 'capture', 'carbon', 'career', 'careful', 'carrier',
        'carry', 'castle', 'casual', 'catch', 'category', 'cause', 'ceiling', 'celebrate', 'center', 'central',
        'century', 'ceremony', 'certain', 'chain', 'chair', 'challenge', 'chamber', 'champion', 'chance', 'change',
        'channel', 'chapter', 'character', 'charge', 'charity', 'chart', 'chase', 'cheap', 'check', 'cheese',
        'chemical', 'chest', 'chicken', 'chief', 'child', 'choice', 'choose', 'church', 'circle', 'citizen',
        'civil', 'claim', 'class', 'classic', 'clean', 'clear', 'climate', 'climb', 'clinic', 'clock',
        'close', 'closet', 'clothes', 'cloud', 'cluster', 'coach', 'coast', 'coffee', 'cold', 'collar',
        'collect', 'college', 'colonial', 'color', 'column', 'combine', 'come', 'comfort', 'command', 'comment',
        'commerce', 'common', 'company', 'compare', 'compete', 'complain', 'complete', 'complex', 'computer', 'concept',
        'concern', 'concert', 'conclude', 'concrete', 'conduct', 'confirm', 'conflict', 'confront', 'confuse', 'congress',
        'connect', 'consider', 'consist', 'constant', 'construct', 'consult', 'consume', 'contact', 'contain', 'content',
        'contest', 'context', 'continue', 'contract', 'contrast', 'control', 'convert', 'convince', 'cook', 'cool',
        'cooperate', 'coordinate', 'corner', 'corporate', 'correct', 'cost', 'cottage', 'cotton', 'council', 'count',
        'counter', 'country', 'county', 'couple', 'courage', 'course', 'court', 'cousin', 'cover', 'crack',
        'craft', 'crash', 'crazy', 'cream', 'create', 'creature', 'credit', 'crew', 'crime', 'crisis',
        'critic', 'crop', 'cross', 'crowd', 'crucial', 'cry', 'culture', 'curious', 'current', 'curve',
        'custom', 'cycle', 'daily', 'damage', 'dance', 'danger', 'dark', 'data', 'database', 'date',
        'daughter', 'dead', 'deal', 'dealer', 'dear', 'death', 'debate', 'debt', 'decade', 'decide',
        'decision', 'declare', 'decline', 'decorate', 'decrease', 'deep', 'defeat', 'defend', 'define', 'degree',
        'delay', 'deliver', 'demand', 'democracy', 'demonstrate', 'deny', 'depart', 'depend', 'depict', 'depression',
        'depth', 'deputy', 'derive', 'describe', 'desert', 'deserve', 'design', 'desire', 'desk', 'despite',
        'destroy', 'detail', 'detect', 'determine', 'develop', 'device', 'devote', 'dialogue', 'differ', 'difficult',
        'dig', 'digital', 'dimension', 'dinner', 'direct', 'direction', 'director', 'dirt', 'disagree', 'disappear',
        'disaster', 'discipline', 'discover', 'discuss', 'disease', 'dismiss', 'disorder', 'display', 'dispute', 'distance',
        'distant', 'distinct', 'distribute', 'district', 'diverse', 'divide', 'division', 'divorce', 'doctor', 'document',
        'domestic', 'dominant', 'dominate', 'door', 'double', 'doubt', 'downtown', 'dozen', 'draft', 'drag',
        'drama', 'dramatic', 'draw', 'drawer', 'drawing', 'dream', 'dress', 'drink', 'drive', 'driver',
        'drop', 'drug', 'during', 'dust', 'duty', 'each', 'eager', 'early', 'earn', 'earth',
        'ease', 'easily', 'east', 'eastern', 'easy', 'economic', 'economy', 'edge', 'edition', 'editor',
        'educate', 'education', 'effect', 'effective', 'efficient', 'effort', 'eight', 'either', 'elderly', 'elect',
        'election', 'electric', 'element', 'eliminate', 'elite', 'else', 'elsewhere', 'embrace', 'emerge', 'emergency',
        'emotion', 'emphasis', 'emphasize', 'employ', 'employee', 'employer', 'empty', 'enable', 'encounter', 'encourage',
        'enemy', 'energy', 'enforce', 'engage', 'engine', 'engineer', 'enhance', 'enjoy', 'enormous', 'enough',
        'ensure', 'enter', 'enterprise', 'entertain', 'entire', 'entrance', 'entry', 'environment', 'equal', 'equipment',
        'error', 'escape', 'especially', 'essay', 'essential', 'establish', 'estate', 'estimate', 'ethnic', 'even',
        'evening', 'event', 'eventually', 'ever', 'every', 'everybody', 'everyday', 'everyone', 'everything', 'everywhere',
        'evidence', 'evolve', 'exact', 'examine', 'example', 'exceed', 'excellent', 'except', 'exchange', 'exciting',
        'exclude', 'excuse', 'execute', 'executive', 'exercise', 'exhibit', 'exist', 'exit', 'expand', 'expect',
        'expense', 'expensive', 'experience', 'experiment', 'expert', 'explain', 'explode', 'explore', 'export', 'expose',
        'express', 'extend', 'extension', 'extensive', 'extent', 'external', 'extra', 'extraordinary', 'extreme', 'fabric',
        'face', 'facility', 'fact', 'factor', 'factory', 'faculty', 'fade', 'fail', 'failure', 'fair',
        'fairly', 'faith', 'fall', 'false', 'familiar', 'family', 'famous', 'fancy', 'fantasy', 'farm',
        'farmer', 'fashion', 'fast', 'father', 'fault', 'favor', 'favorite', 'fear', 'feature', 'federal',
        'fee', 'feed', 'feel', 'feeling', 'fellow', 'female', 'fence', 'festival', 'fetch', 'fever',
        'fewer', 'fiber', 'fiction', 'field', 'fifteen', 'fifth', 'fifty', 'fight', 'figure', 'file',
        'fill', 'film', 'final', 'finally', 'finance', 'financial', 'find', 'finding', 'fine', 'finger',
        'finish', 'fire', 'firm', 'first', 'fiscal', 'fish', 'fishing', 'fitness', 'five', 'fixed'
    ];
    phrase TEXT := '';
    i INTEGER;
    word_count INTEGER := 20;
    random_idx INTEGER;
BEGIN
    FOR i IN 1..word_count LOOP
        random_idx := floor(random() * array_length(words, 1) + 1)::INTEGER;
        IF i = 1 THEN
            phrase := words[random_idx];
        ELSE
            phrase := phrase || ' ' || words[random_idx];
        END IF;
    END LOOP;
    
    RETURN phrase;
END;
$$;