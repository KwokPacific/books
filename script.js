const N8N_ENDPOINT = 'https://n8n.myaloha.vn/webhook/drive-photo-essay'; // Đổi lại domain của bạn

document.getElementById('essayForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const imageUrl = document.getElementById('imageUrl').value.trim();
  if (!imageUrl) return;

  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '<div style="width:100%;text-align:center;"><em>Đang tạo tản văn, vui lòng chờ...</em></div>';

  try {
    const res = await fetch(N8N_ENDPOINT, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ imageUrl })
    });
    const data = await res.json();
    if (data.error || data.success === false) {
      resultDiv.innerHTML = `<div style="color:red;"><strong>Lỗi:</strong> ${data.error?.message || 'Không thể tạo tản văn.'}</div>`;
      return;
    }
    // Render kiểu sách: ảnh trái, văn phải
    resultDiv.innerHTML = `
      <div class="photo">
        <img src="${convertDriveToDirectLink(imageUrl)}" alt="Ảnh trải nghiệm" />
      </div>
      <div class="essay">
        ${data.text ? escapeHTML(data.text) : '<em>Không có tản văn.</em>'}
      </div>
    `;
  } catch (err) {
    resultDiv.innerHTML = `<div style="color:red;">Lỗi kết nối server hoặc không nhận được kết quả!</div>`;
  }
});

// Chuyển link Google Drive sang link ảnh trực tiếp
function convertDriveToDirectLink(url) {
  // Hỗ trợ kiểu: https://drive.google.com/file/d/ID/view hoặc https://drive.google.com/uc?id=ID
  const idMatch = url.match(/(?:file\/d\/|id=)([\w-]+)/);
  if (idMatch && idMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
  }
  return url;
}

// Chống XSS khi hiển thị văn bản
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  }[c]));
}
