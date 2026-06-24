import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ehoyoozpfvwkfiezfprc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVob3lvb3pwZnZ3a2ZpZXpmcHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MzI2MDgsImV4cCI6MjA4NjEwODYwOH0.sTRGvwLplVRkWeT4ng-PUnsgbXZeAl_BoBYZrIC_u1g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
