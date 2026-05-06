// ------------------------------
// Supabase 初期化
// ------------------------------
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://tytevvhanakxdeqamsfh.supabase.co/rest/v1/";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5dGV2dmhhbmFreGRlcWFtc2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMDk2ODksImV4cCI6MjA5MzU4NTY4OX0.DKkbWEoNhrxx2ntl5iDbuBbr1OI4FLHe-IqqJdFY5Ls";
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------------------
// 本の保存（クラウド）
// ------------------------------
async function saveBook() {
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const isbn = document.getElementById("isbn").value;
  const status = document.getElementById("status").value;
  const due_date = document.getElementById("due_date").value;

  await supabase.from("books").insert({
    title,
    author,
    isbn,
    status,
    due_date
  });

  loadBooks();
}

// ------------------------------
// 本の読み込み（クラウド）
// ------------------------------
async function loadBooks() {
  const { data } = await supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });

  books = data;
  renderBooks();
}

let books = [];
loadBooks();

// ------------------------------
// 一覧表示 & 検索
// ------------------------------
function renderBooks() {
  const q = document.getElementById("search").value.toLowerCase();
  const list = document.getElementById("list");

  list.innerHTML = books
    .filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.isbn.includes(q)
    )
    .map(b => `
      <div class="book-item">