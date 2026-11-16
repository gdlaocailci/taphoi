/* ========================================================================== */
/* MODULE: KẾT QUẢ KIỂM TRA NỘI BỘ (KetQuaKiemTra.js)                        */
/* Phụ thuộc có sẵn từ index.html: google.script.run.skt_timbg_kq, chuyentth  */
/* ========================================================================== */
(function () {
  const KQKT_CONTAINER_ID = "TabKetQuaKT";
  let kqktDaKhoiTao = false;
  let kqktDangTai = false;

  // 1. NẠP CSS RIÊNG CHO MODULE
  function kqkt_napCSS() {
    if (document.getElementById("kqkt-style")) return;
    const style = document.createElement("style");
    style.id = "kqkt-style";
    style.textContent = `
      .kqkt-layout {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: calc(100vh - 16px);
        box-sizing: border-box;
        font-family: "Times New Roman", serif;
      }
      .kqkt-header {
        background: #ffffff;
        padding: 10px 14px;
        border-radius: 6px;
        border-top: 3px solid #b91c1c;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        margin-bottom: 8px;
        flex-shrink: 0;
        text-align: center;
      }
      .kqkt-title {
        font-size: 22px;
        font-weight: 900;
        color: #b91c1c;
        text-transform: uppercase;
        margin: 0 0 6px 0;
        letter-spacing: 0.8px;
      }
      .kqkt-subtitle-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 15px;
        color: #1e3a8a;
        font-weight: bold;
      }
      .kqkt-date-input {
        width: 115px;
        height: 30px;
        padding: 2px 6px;
        border: 1px solid #94a3b8;
        border-radius: 4px;
        text-align: center;
        font-family: "Times New Roman", serif;
        font-size: 14px;
        font-weight: bold;
        color: #0f172a;
        outline: none;
      }
      .kqkt-date-input:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.18);
      }
      .kqkt-btn {
        height: 30px;
        padding: 0 14px;
        border: none;
        border-radius: 4px;
        font-size: 13px;
        font-weight: bold;
        cursor: pointer;
        color: #fff;
        background: linear-gradient(135deg, #1e3a8a, #2563eb);
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: 0.2s;
      }
      .kqkt-btn:hover { opacity: 0.92; transform: translateY(-1px); }
      .kqkt-btn:disabled { background: #9ca3af; cursor: wait; transform: none; }
      .kqkt-btn-reset {
        background: linear-gradient(135deg, #b91c1c, #dc2626);
        padding: 0 10px;
      }

      /* KHUNG BẢNG: CÂN ĐỐI 100% MÀN HÌNH + TỰ TRÀN THANH TRƯỢT NGANG */
      .kqkt-table-wrap {
        flex: 1 1 auto;
        min-height: 0;
        width: 100%;
        overflow-x: auto;
        overflow-y: auto;
        border: 1px solid #9ca3af;
        background: #ffffff;
        position: relative;
      }
      .kqkt-table {
        width: 100%;
        min-width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        table-layout: auto;
        font-family: "Times New Roman", serif;
      }
      .kqkt-table th,
      .kqkt-table td {
        border-right: 1px solid #cbd5e1 !important;
        border-bottom: 1px solid #cbd5e1 !important;
        border-top: none !important;
        border-left: none !important;
        padding: 6px 6px;
        font-size: 14px;
        box-sizing: border-box;
      }
      /* Tiêu đề 2 tầng cố định khi cuộn dọc */
      .kqkt-table thead tr:first-child th {
        position: sticky;
        top: 0;
        height: 34px;
        z-index: 20;
        background: #e0f2fe;
        color: #0c4a6e;
        font-weight: bold;
        text-align: center;
        border-top: 1px solid #94a3b8 !important;
      }
      .kqkt-table thead tr:nth-child(2) th {
        position: sticky;
        top: 34px;
        height: 34px;
        z-index: 20;
        background: #eff6ff;
        color: #1e3a8a;
        font-weight: bold;
        text-align: center;
        min-width: 95px; /* Ngưỡng hẹp tối thiểu trước khi tràn ngang */
        white-space: nowrap;
      }

      /* Cố định 2 cột đầu (STT & Họ và tên) khi cuộn ngang */
      .kqkt-col-stt {
        width: 52px;
        min-width: 52px;
        max-width: 52px;
        text-align: center;
        position: sticky;
        left: 0;
        z-index: 15;
        background: #ffffff;
      }
      .kqkt-col-gv {
        width: 210px;
        min-width: 190px;
        max-width: 240px;
        text-align: left;
        font-weight: bold;
        color: #0f172a;
        position: sticky;
        left: 52px;
        z-index: 15;
        background: #ffffff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .kqkt-table thead tr:first-child th.kqkt-col-stt {
        z-index: 30;
        left: 0;
        background: #e0f2fe;
      }
      .kqkt-table thead tr:first-child th.kqkt-col-gv {
        z-index: 30;
        left: 52px;
        background: #e0f2fe;
      }

      /* Ô kết quả xếp loại */
      .kqkt-cell-xl {
        min-width: 95px;
        text-align: center;
        vertical-align: middle;
        font-weight: bold;
        line-height: 1.3;
        white-space: nowrap;
      }
      .kqkt-xl-tot { color: #15803d; background: #f0fdf4 !important; }
      .kqkt-xl-kha { color: #1d4ed8; background: #eff6ff !important; }
      .kqkt-xl-tb  { color: #b45309; background: #fffbeb !important; }
      .kqkt-xl-yeu { color: #b91c1c; background: #fef2f2 !important; }
      .kqkt-empty  { text-align: center; padding: 24px !important; font-style: italic; color: #64748b; }
    `;
    document.head.appendChild(style);
  }

  // 2. HÀM TIỆN ÍCH NGÀY THÁNG (dd/mm/yyyy)
  function kqkt_dinhDangNgayInput(e) {
    let v = e.target.value.replace(/\D/g, "").slice(0, 8);
    if (v.length >= 5) v = v.slice(0, 2) + "/" + v.slice(2, 4) + "/" + v.slice(4);
    else if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
    e.target.value = v;
  }

  function kqkt_parseNgay(str) {
    if (!str) return 0;
    const p = String(str).trim().split("/");
    if (p.length !== 3) return 0;
    const d = new Date(parseInt(p[2], 10), parseInt(p[1], 10) - 1, parseInt(p[0], 10));
    return isNaN(d.getTime()) ? 0 : d.getTime();
  }

  function kqkt_setNgayMacDinh() {
    const homNay = new Date();
    const namNay = homNay.getFullYear();
    const dd = String(homNay.getDate()).padStart(2, "0");
    const mm = String(homNay.getMonth() + 1).padStart(2, "0");

    const tuInput = document.getElementById("kqkt_tu_ngay");
    const denInput = document.getElementById("kqkt_den_ngay");
    if (tuInput) tuInput.value = `${dd}/${mm}/${namNay - 1}`;
    if (denInput) denInput.value = `${dd}/${mm}/${namNay}`;
  }

  // 3. DỰNG KHUNG GIAO DIỆN VÀO #TabKetQuaKT
  function kqkt_dungGiaoDien() {
    const container = document.getElementById(KQKT_CONTAINER_ID);
    if (!container) return;

    kqkt_napCSS();
    container.innerHTML = `
      <div class="kqkt-layout">
        <div class="kqkt-header">
          <div class="kqkt-title">KẾT QUẢ KIỂM TRA NỘI BỘ</div>
          <div class="kqkt-subtitle-row">
            <span>Từ ngày</span>
            <input type="text" id="kqkt_tu_ngay" class="kqkt-date-input" placeholder="dd/mm/yyyy" autocomplete="off">
            <span>đến ngày</span>
            <input type="text" id="kqkt_den_ngay" class="kqkt-date-input" placeholder="dd/mm/yyyy" autocomplete="off">
            <button id="kqkt_btn_xem" class="kqkt-btn" onclick="kqkt_taiDuLieu()">🔍 Xem kết quả</button>
            <button class="kqkt-btn kqkt-btn-reset" onclick="kqkt_datLai()" title="Đặt lại 1 năm gần nhất">↻</button>
          </div>
        </div>

        <div class="kqkt-table-wrap">
          <table class="kqkt-table" id="kqkt_table">
            <thead id="kqkt_thead">
              <tr>
                <th rowspan="2" class="kqkt-col-stt">STT</th>
                <th rowspan="2" class="kqkt-col-gv">Họ và tên</th>
                <th colspan="1">Kết quả</th>
              </tr>
              <tr>
                <th>Ngày kiểm tra</th>
              </tr>
            </thead>
            <tbody id="kqkt_tbody">
              <tr><td colspan="3" class="kqkt-empty">Đang chuẩn bị dữ liệu...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    const tuEl = document.getElementById("kqkt_tu_ngay");
    const denEl = document.getElementById("kqkt_den_ngay");
    [tuEl, denEl].forEach((el) => {
      if (!el) return;
      el.addEventListener("input", kqkt_dinhDangNgayInput);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          kqkt_taiDuLieu();
        }
      });
    });

    kqkt_setNgayMacDinh();
    kqktDaKhoiTao = true;
  }

  // 4. RÚT TRÍCH GIÁ TRỊ XẾP LOẠI TỪ 1 BẢN GHI DATAKT (CỘT 9, 10, 11, 12)
  function kqkt_layXepLoai(row) {
    const cacLoai = [
      { nhan: "HS", gt: String(row[9] || "").trim() },
      { nhan: "GD", gt: String(row[10] || "").trim() },
      { nhan: "KS", gt: String(row[11] || "").trim() },
      { nhan: "Khác", gt: String(row[12] || "").trim() }
    ].filter((m) => m.gt !== "");

    if (cacLoai.length === 0) return "";
    if (cacLoai.length === 1) return cacLoai[0].gt;
    return cacLoai.map((m) => `${m.nhan}: ${m.gt}`).join("<br>");
  }

  function kqkt_classMauXL(text) {
    const t = String(text || "").toLowerCase();
    if (!t) return "";
    if (t.includes("yếu") || t.includes("chưa đạt")) return "kqkt-xl-yeu";
    if (t.includes("trung bình") || t === "tb" || t.includes("đạt")) return "kqkt-xl-tb";
    if (t.includes("khá")) return "kqkt-xl-kha";
    if (t.includes("tốt") || t.includes("giỏi")) return "kqkt-xl-tot";
    return "";
  }

  // 5. DỰNG BẢNG MA TRẬN (GIÁO VIÊN × NGÀY KIỂM TRA)
  function kqkt_renderBang(dsBanGhi) {
    const thead = document.getElementById("kqkt_thead");
    const tbody = document.getElementById("kqkt_tbody");
    if (!thead || !tbody) return;

    if (!Array.isArray(dsBanGhi) || dsBanGhi.length === 0) {
      thead.innerHTML = `
        <tr>
          <th rowspan="2" class="kqkt-col-stt">STT</th>
          <th rowspan="2" class="kqkt-col-gv">Họ và tên</th>
          <th colspan="1">Kết quả</th>
        </tr>
        <tr><th>Ngày kiểm tra</th></tr>
      `;
      tbody.innerHTML = `<tr><td colspan="3" class="kqkt-empty">Không có dữ liệu kiểm tra trong khoảng thời gian đã chọn.</td></tr>`;
      return;
    }

    // Gom danh sách ngày kiểm tra duy nhất & sắp xếp tăng dần
    const tapNgay = new Set();
    const mapKetQua = new Map(); // key: "TenGV|||Ngay" -> mảng { text, tooltip }
    const tapGiaoVienCoKQ = new Set();

    dsBanGhi.forEach((row) => {
      const gv = String(row[0] || "").trim();
      const ngay = String(row[4] || "").trim();
      if (!gv || !ngay) return;

      tapNgay.add(ngay);
      tapGiaoVienCoKQ.add(gv);

      const xl = kqkt_layXepLoai(row);
      const noiDung = String(row[5] || "").trim();
      const nguoiKT = String(row[1] || "").trim();
      const tip = [
        `Ngày: ${ngay}`,
        nguoiKT ? `Người KT: ${nguoiKT}` : "",
        noiDung ? `Nội dung: ${noiDung}` : ""
      ].filter(Boolean).join(" | ");

      const key = `${gv}|||${ngay}`;
      if (!mapKetQua.has(key)) mapKetQua.set(key, []);
      mapKetQua.get(key).push({ text: xl || "—", tooltip: tip });
    });

    const dsNgay = Array.from(tapNgay).sort((a, b) => kqkt_parseNgay(a) - kqkt_parseNgay(b));

    // Lấy danh sách giáo viên ưu tiên theo danh sách hệ thống (window.ruongbac.conmeo)
    let dsGiaoVien = [];
    if (window.ruongbac && Array.isArray(window.ruongbac.conmeo) && window.ruongbac.conmeo.length > 0) {
      dsGiaoVien = window.ruongbac.conmeo.map((gv) => String(gv.tenn || "").trim()).filter(Boolean);
      tapGiaoVienCoKQ.forEach((gv) => {
        if (!dsGiaoVien.includes(gv)) dsGiaoVien.push(gv);
      });
    } else {
      dsGiaoVien = Array.from(tapGiaoVienCoKQ).sort((a, b) => a.localeCompare(b, "vi"));
    }

    // Dựng phần đầu bảng 2 dòng
    thead.innerHTML = `
      <tr>
        <th rowspan="2" class="kqkt-col-stt">STT</th>
        <th rowspan="2" class="kqkt-col-gv">Họ và tên</th>
        <th colspan="${dsNgay.length}">Kết quả</th>
      </tr>
      <tr>
        ${dsNgay.map((ngay) => `<th>${ngay}</th>`).join("")}
      </tr>
    `;

    // Dựng các dòng dữ liệu
    const htmlRows = dsGiaoVien.map((gv, idx) => {
      const cells = dsNgay.map((ngay) => {
        const items = mapKetQua.get(`${gv}|||${ngay}`);
        if (!items || items.length === 0) {
          return `<td class="kqkt-cell-xl"></td>`;
        }
        const noiDungO = items.map((i) => i.text).join("<br>");
        const titleO = items.map((i) => i.tooltip).join("\n").replace(/"/g, "&quot;");
        const clsMau = kqkt_classMauXL(items[0].text);
        return `<td class="kqkt-cell-xl ${clsMau}" title="${titleO}">${noiDungO}</td>`;
      }).join("");

      return `
        <tr>
          <td class="kqkt-col-stt">${idx + 1}</td>
          <td class="kqkt-col-gv" title="${gv.replace(/"/g, "&quot;")}">${gv}</td>
          ${cells}
        </tr>
      `;
    }).join("");

    tbody.innerHTML = htmlRows;
  }

  // 6. GỌI API BACKEND (DÙNG CHUNG skt_timbg_kq TRONG code.gs)
  window.kqkt_taiDuLieu = function () {
    if (kqktDangTai) return;
    const tuNgay = (document.getElementById("kqkt_tu_ngay")?.value || "").trim();
    const denNgay = (document.getElementById("kqkt_den_ngay")?.value || "").trim();

    const btn = document.getElementById("kqkt_btn_xem");
    const tbody = document.getElementById("kqkt_tbody");
    kqktDangTai = true;
    if (btn) {
      btn.disabled = true;
      btn.innerText = "⏳ Đang tải...";
    }
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="20" class="kqkt-empty">Đang tổng hợp kết quả kiểm tra...</td></tr>`;
    }

    google.script.run
      .withSuccessHandler((kq) => {
        kqktDangTai = false;
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = "🔍 Xem kết quả";
        }
        kqkt_renderBang(kq || []);
      })
      .withFailureHandler((err) => {
        kqktDangTai = false;
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = "🔍 Xem kết quả";
        }
        if (tbody) {
          tbody.innerHTML = `<tr><td colspan="20" class="kqkt-empty" style="color:#dc2626;">Lỗi tải dữ liệu: ${err.message}</td></tr>`;
        }
      })
      .skt_timbg_kq({ gkiem: "", nkiem: "", bkiem: "", tkiem: tuNgay, dkiem: denNgay });
  };

  window.kqkt_datLai = function () {
    kqkt_setNgayMacDinh();
    kqkt_taiDuLieu();
  };

  // HÀM MỞ TAB (GỌI TỪ MENU DỌC)
  window.kqkt_moTab = function (nutMenu) {
    if (typeof chuyentth === "function") {
      chuyentth(KQKT_CONTAINER_ID, nutMenu);
    }
    if (!kqktDaKhoiTao) {
      kqkt_dungGiaoDien();
      kqkt_taiDuLieu();
    }
  };
})();