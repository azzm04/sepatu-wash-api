require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { z } = require('zod');
const { supabase } = require('./supabaseClient');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/', (req, res) => {
  res.json({
    name: 'Sepatu Wash API',
    version: '1.0.0',
    status: 'ok',
    docs: '/docs'
  });
});

app.get('/docs', (req, res) => {
  res.json({
    routes: {
      list: 'GET /items?status=Menunggu|Proses|Selesai|Diambil',
      detail: 'GET /items/:id',
      create: 'POST /items',
      update: 'PATCH /items/:id',
      delete: 'DELETE /items/:id'
    }
  });
});

const statusEnum = ['Menunggu','Proses','Selesai','Diambil'];

// Validation schema (create & update)
const createSchema = z.object({
  customer_name: z.string().min(1),
  brand: z.string().optional(),
  size: z.string().optional(),
  service_type: z.string().optional(),
  status: z.enum(statusEnum).optional(),
  drop_off_date: z.string().optional(), // YYYY-MM-DD
  pick_up_date: z.string().optional(),
  notes: z.string().optional()
});

const updateSchema = createSchema.partial();

// GET /items?status=
app.get('/items', async (req, res) => {
  const { status } = req.query;
  let query = supabase.from('wash_items').select('*').order('created_at', { ascending: false });
  if (status) {
    if (!statusEnum.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    query = query.eq('status', status);
  }
  const { data, error } = await query;
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json({ data });
});

// GET /items/:id
app.get('/items/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('wash_items').select('*').eq('id', id).single();
  if (error) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json({ data });
});

// POST /items
app.post('/items', async (req, res) => {
  const parse = createSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.flatten() });
  }
  const payload = parse.data;
  const { data, error } = await supabase.from('wash_items').insert(payload).select('*').single();
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json({ data });
});

// PATCH /items/:id
app.patch('/items/:id', async (req, res) => {
  const { id } = req.params;
  const parse = updateSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.flatten() });
  }
  const payload = parse.data;
  const { data, error } = await supabase.from('wash_items').update(payload).eq('id', id).select('*').single();
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json({ data });
});

// DELETE /items/:id
app.delete('/items/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('wash_items').delete().eq('id', id);
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(204).send();
});

// NOTE: untuk Vercel, jangan panggil app.listen di export default
// Namun untuk lokal dev, kita jalankan jika file dieksekusi langsung.
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Sepatu Wash API running at http://localhost:${PORT}`);
  });
}

module.exports = app; // Vercel akan mengekspor handler dari Express app
