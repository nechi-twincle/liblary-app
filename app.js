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
        <strong>${b.title}</strong><br>
        ${b.author}<br>
        ISBN: ${b.isbn}<br>
        状態: ${b.status}<br>
        返却日: ${b.due_date || ""}<br>
        <img class="book-cover" src="https://covers.openlibrary.org/b/isbn/${b.isbn}-L.jpg" onerror="this.style.display='none'">
      </div>
    `)
    .join("");
}

// ------------------------------
// ISBN → タイトル・著者 自動取得
// ------------------------------
async function autoFill() {
  const isbn = document.getElementById("isbn").value;
  if (!isbn) return alert("ISBNを入力してください");

  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
  const res = await fetch(url);
  const data = await res.json();
  const book = data[`ISBN:${isbn}`];

  if (!book) {
    alert("情報が見つかりません");
    return;
  }

  document.getElementById("title").value = book.title || "";
  document.getElementById("author").value = book.authors?.[0]?.name || "";
}

// ------------------------------
// バーコードスキャン（iPhone対応）
// ------------------------------
async function scanBarcode() {
  if (!("BarcodeDetector" in window)) {
    alert("このブラウザはバーコードスキャンに対応していません");
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" }
  });

  const video = document.createElement("video");
  video.srcObject = stream;
  await video.play();

  const barcodeDetector = new BarcodeDetector({ formats: ["ean_13"] });

  const detect = () => {
    barcodeDetector.detect(video).then(async codes => {
      if (codes.length > 0) {
        const isbn = codes[0].rawValue;
        document.getElementById("isbn").value = isbn;

        await autoFill();

        stream.getTracks().forEach(t => t.stop());
      } else {
        requestAnimationFrame(detect);
      }
    });
  };

  detect();
}
