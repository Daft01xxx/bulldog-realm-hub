-- Исправляем RLS политики для безопасности и правильной работы
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Создаем правильные RLS политики
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Создаем функцию для добавления v-Bdog баланса
CREATE OR REPLACE FUNCTION public.add_v_bdog_balance(amount bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    v_bdog_earned = COALESCE(v_bdog_earned, 0) + amount,
    updated_at = now()
  WHERE user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for current user';
  END IF;
END;
$$;

-- Создаем функцию для добавления BDOG баланса
CREATE OR REPLACE FUNCTION public.add_bdog_balance(amount numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    bdog_balance = COALESCE(bdog_balance, 0) + amount,
    updated_at = now()
  WHERE user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for current user';
  END IF;
END;
$$;

-- Создаем функцию для добавления косточек
CREATE OR REPLACE FUNCTION public.add_bones(amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    bone = COALESCE(bone, 0) + amount,
    updated_at = now()
  WHERE user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for current user';
  END IF;
END;
$$;

-- Создаем функцию для отметки задания как выполненного
CREATE OR REPLACE FUNCTION public.complete_task(task_id text, reward_amount numeric DEFAULT 0)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_tasks text;
  tasks_array text[];
  task_exists boolean := false;
BEGIN
  -- Получаем текущие выполненные задания
  SELECT completed_tasks INTO current_tasks
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  IF current_tasks IS NULL THEN
    current_tasks := '';
  END IF;
  
  -- Проверяем, не выполнено ли уже это задание
  tasks_array := string_to_array(current_tasks, ',');
  
  FOREACH task_id IN ARRAY tasks_array
  LOOP
    IF trim(task_id) = task_id THEN
      task_exists := true;
      EXIT;
    END IF;
  END LOOP;
  
  -- Если задание не выполнено, добавляем его и награду
  IF NOT task_exists THEN
    UPDATE public.profiles 
    SET 
      completed_tasks = CASE 
        WHEN completed_tasks IS NULL OR completed_tasks = '' THEN task_id
        ELSE completed_tasks || ',' || task_id
      END,
      bdog_balance = COALESCE(bdog_balance, 0) + reward_amount,
      updated_at = now()
    WHERE user_id = auth.uid();
    
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;