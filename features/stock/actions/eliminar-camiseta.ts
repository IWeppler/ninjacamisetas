'use server';

import { createClient } from '@/shared/config/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function eliminarCamisetaAction(id: string) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
      .from('camisetas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(error);
      return { error: 'No se pudo eliminar la camiseta de la base de datos.', success: false };
    }

    revalidatePath('/stock');
    revalidatePath('/ventas');

    return { error: null, success: true };
  } catch (err) {
    console.error('Error in eliminarCamisetaAction:', err);
    return { error: 'Ocurrió un error inesperado al intentar eliminar.', success: false };
  }
}