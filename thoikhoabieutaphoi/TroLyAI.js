(function () {
    let dangTraLoi = false;

    // =========================================================================
    // THUẬT TOÁN TRÍCH XUẤT DỮ LIỆU THÔNG MINH TRÊN MÀN HÌNH
    // =========================================================================
    function layGiaTriO(cell) {
        if (!cell) return '';
        const inputs = cell.querySelectorAll('input, select, textarea');
        if (inputs.length > 0) {
            return Array.from(inputs)
                .map(el => (el.tagName === 'SELECT' ? (el.options[el.selectedIndex]?.text || el.value) : el.value) || '')
                .join(' ')
                .trim();
        }
        return (cell.innerText || '').replace(/\s+/g, ' ').trim();
    }

    function laPhanTuDangHien(el) {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
    }

    // 1. Bộ đọc chuyên sâu cho Lưới TKB Toàn trường (#khungTKB)
    function trichXuatTKBToanTruong() {
        const tuan = document.getElementById('hienThiTuanHienTai')?.value || '';
        const ngayBatDau = document.getElementById('chonNgayDauTuan')?.value || '';
        const locGV = document.getElementById('locGiaoVien')?.value?.trim() || '';
        const locLop = document.getElementById('locLopHoc')?.value?.trim() || '';

        // Tìm tên các lớp ở hàng đầu tiên của thead (bỏ 3 cột đầu: Thứ/Ngày, Buổi, Tiết)
        const theadRows = Array.from(document.querySelectorAll('#tieuDeBang tr'));
        const dsLop = [];
        if (theadRows.length > 0) {
            const headerCells = Array.from(theadRows[0].querySelectorAll('th'));
            for (let i = 3; i < headerCells.length; i++) {
                const th = headerCells[i];
                if (!laPhanTuDangHien(th)) {
                    dsLop.push(null);
                    continue;
                }
                dsLop.push((th.innerText || '').replace(/\s+/g, ' ').trim());
            }
        }

        // Đọc dòng cảnh báo tiến độ/thiếu tiết của từng lớp (nếu có trong thead)
        const canhBaoLop = [];
        for (let r = 1; r < theadRows.length; r++) {
            const cells = Array.from(theadRows[r].querySelectorAll('th, td'));
            cells.forEach((c, idx) => {
                const txt = (c.innerText || '').replace(/\s+/g, ' ').trim();
                if (txt && txt !== 'Môn' && txt !== 'N dạy' && (txt.includes('/') || txt.toLowerCase().includes('thiếu') || txt.toLowerCase().includes('thừa'))) {
                    const tenLop = dsLop[idx] || `Cột ${idx + 1}`;
                    canhBaoLop.push(`${tenLop}: ${txt}`);
                }
            });
        }

        const rows = Array.from(document.querySelectorAll('#vungHienThiDuLieu tr'));
        let curThu = '';
        let curBuoi = '';
        const thongKeGV = {};
        const chiTietTheoTiet = [];

        rows.forEach(tr => {
            if (!laPhanTuDangHien(tr)) return;
            const cells = Array.from(tr.querySelectorAll('td'));
            if (cells.length === 0) return;

            // Xác định vị trí cột bắt đầu phần dữ liệu lớp (dựa vào ô Tiết có id="oTiet_...")
            let idxTiet = cells.findIndex(td => td.id && td.id.startsWith('oTiet_'));
            if (idxTiet === -1) {
                // Dự phòng theo số cột bị gộp rowspan
                if (cells.length >= 3 && /^(thứ|chủ nhật)/i.test(layGiaTriO(cells[0]))) idxTiet = 2;
                else if (cells.length >= 2 && /^(sáng|chiều)/i.test(layGiaTriO(cells[0]))) idxTiet = 1;
                else idxTiet = 0;
            }

            if (idxTiet === 2) {
                curThu = layGiaTriO(cells[0]);
                curBuoi = layGiaTriO(cells[1]);
            } else if (idxTiet === 1) {
                curBuoi = layGiaTriO(cells[0]);
            }
            const curTiet = layGiaTriO(cells[idxTiet]);

            const dsMonTrongTiet = [];
            let lopIndex = 0;

            for (let c = idxTiet + 1; c < cells.length; c += 2) {
                const cellMon = cells[c];
                const cellGV = cells[c + 1];
                if (!cellMon || !cellGV) break;

                // Bỏ qua nếu cột lớp đang bị ẩn do lọc
                while (lopIndex < dsLop.length && dsLop[lopIndex] === null) {
                    lopIndex++;
                }
                const tenLop = dsLop[lopIndex] || `Lớp_${lopIndex + 1}`;
                lopIndex++;

                if (!laPhanTuDangHien(cellMon) && !laPhanTuDangHien(cellGV)) continue;

                const mon = layGiaTriO(cellMon);
                const gv = layGiaTriO(cellGV);

                if ((mon && mon !== '--' && mon !== '---') || (gv && gv !== '--' && gv !== '---')) {
                    dsMonTrongTiet.push(`${tenLop}(${mon || '?'} - ${gv || '?'})`);
                    if (gv && gv !== '--' && gv !== '---') {
                        if (!thongKeGV[gv]) thongKeGV[gv] = { soTiet: 0, lop: new Set() };
                        thongKeGV[gv].soTiet += 1;
                        thongKeGV[gv].lop.add(tenLop);
                    }
                }
            }

            if (dsMonTrongTiet.length > 0) {
                chiTietTheoTiet.push(`${curThu} | ${curBuoi} | Tiết ${curTiet}: ${dsMonTrongTiet.join('; ')}`);
            }
        });

        const tomTatGV = Object.entries(thongKeGV)
            .sort((a, b) => b[1].soTiet - a[1].soTiet)
            .map(([gv, info]) => `- ${gv}: ${info.soTiet} tiết (Lớp: ${Array.from(info.lop).join(', ')})`)
            .join('\n');

        let ketQua = `MÀN HÌNH: Thời khóa biểu Tuần ${tuan}` + (ngayBatDau ? ` (Từ ngày ${ngayBatDau})` : '');
        if (locGV) ketQua += ` | Đang lọc GV: ${locGV}`;
        if (locLop) ketQua += ` | Đang lọc Lớp: ${locLop}`;
        ketQua += '\n';

        if (canhBaoLop.length > 0) {
            ketQua += `\n[Tình trạng số tiết các lớp]\n${canhBaoLop.join('\n')}\n`;
        }
        if (tomTatGV) {
            ketQua += `\n[Tổng hợp số tiết theo Giáo viên đang hiển thị]\n${tomTatGV}\n`;
        }
        if (chiTietTheoTiet.length > 0) {
            ketQua += `\n[Chi tiết từng tiết học]\n${chiTietTheoTiet.join('\n')}`;
        }

        return ketQua.slice(0, 14000);
    }

    // 2. Bộ đọc tổng quát cho Sổ đầu bài, Thống kê, Chuyên cần và các Modal đang mở
    function trichXuatBangTongQuat(container, tieuDe) {
        const blocks = [];
        const tables = Array.from(container.querySelectorAll('table'));

        if (tables.length > 0) {
            tables.forEach((tbl, idx) => {
                if (!laPhanTuDangHien(tbl)) return;
                const rows = Array.from(tbl.querySelectorAll('tr')).filter(laPhanTuDangHien);
                const lines = rows.map(tr =>
                    Array.from(tr.querySelectorAll('th, td'))
                        .filter(laPhanTuDangHien)
                        .map(layGiaTriO)
                        .filter(Boolean)
                        .join(' | ')
                ).filter(Boolean);
                if (lines.length > 0) {
                    blocks.push(`[Bảng ${idx + 1}]\n${lines.join('\n')}`);
                }
            });
        }

        const noiDungBang = blocks.join('\n\n');
        const vanBanBoSung = noiDungBang || (container.innerText || '').replace(/\n{3,}/g, '\n\n').trim();
        return `MÀN HÌNH: ${tieuDe}\n${vanBanBoSung}`.slice(0, 14000);
    }

    function layNguCanhTrangHienTai() {
        // Ưu tiên 1: Nếu đang mở Modal (Thống kê số tiết GV, Kiểm tra tiến độ, Kiểm tra định mức)
        const dsModal = [
            { id: 'modalThongKeGV', ten: 'Bảng thống kê số tiết dạy thực tế của Giáo viên' },
            { id: 'modalKiemTraTienDo', ten: 'Báo cáo kiểm tra tiến độ dạy học' },
            { id: 'modalKiemTra', ten: 'Báo cáo đối chiếu định mức khung chương trình' }
        ];
        for (const m of dsModal) {
            const el = document.getElementById(m.id);
            if (el && !el.classList.contains('hidden') && laPhanTuDangHien(el)) {
                return trichXuatBangTongQuat(el, m.ten);
            }
        }

        // Ưu tiên 2: Lưới TKB Toàn trường
        const khungTKB = document.getElementById('khungTKB');
        if (khungTKB && !khungTKB.classList.contains('hidden') && laPhanTuDangHien(khungTKB)) {
            return trichXuatTKBToanTruong();
        }

        // Ưu tiên 3: Sổ đầu bài điện tử
        const khungSDB = document.getElementById('khungSoDauBai');
        if (khungSDB && !khungSDB.classList.contains('hidden') && laPhanTuDangHien(khungSDB)) {
            const lop = document.getElementById('chonLopSo')?.value || '';
            const tuan = document.getElementById('chonTuanSo')?.value || '';
            return trichXuatBangTongQuat(khungSDB, `Sổ đầu bài điện tử - Lớp ${lop}, Tuần ${tuan}`);
        }

        // Ưu tiên 4: Bất kỳ phân hệ nào khác đang mở trong #vungHienThiChinh
        const vungChinh = document.getElementById('vungHienThiChinh');
        if (vungChinh) {
            const khungDangMo = Array.from(vungChinh.children).find(el => !el.classList.contains('hidden') && laPhanTuDangHien(el));
            if (khungDangMo) {
                const tieuDe = khungDangMo.querySelector('h2')?.innerText?.trim() || khungDangMo.id;
                return trichXuatBangTongQuat(khungDangMo, tieuDe);
            }
        }

        return 'MÀN HÌNH: Hệ thống Quản lý Chương trình Dạy - Học.';
    }

    // =========================================================================
    // GIAO DIỆN HỘP THOẠI CHAT AI
    // =========================================================================
    function taoGiaoDienTroLyAI() {
        if (document.getElementById('cumTroLyAINoiBo')) return;

        const wrapper = document.createElement('div');
        wrapper.id = 'cumTroLyAINoiBo';
        wrapper.className = 'fixed bottom-10 right-4 z-[9990] font-sans';
        wrapper.innerHTML = `
            <button id="btnMoTroLyAI" type="button"
                class="flex items-center gap-2 bg-[#0b5394] hover:bg-[#1e70b8] text-white font-bold px-4 py-2.5 rounded-full shadow-xl border border-blue-300 transition-all cursor-pointer">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z"/>
                </svg>
                <span class="text-sm">Trợ lý Gemini</span>
            </button>

            <div id="hopChatTroLyAI" class="hidden w-[360px] max-w-[92vw] h-[480px] bg-white border border-slate-300 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <div class="bg-[#0b5394] text-white px-4 py-3 flex items-center justify-between">
                    <div>
                        <div class="font-bold text-sm">Trợ lý Gemini Nhà trường</div>
                        <div class="text-[11px] text-blue-200">Tự động đọc dữ liệu màn hình đang mở</div>
                    </div>
                    <button id="btnDongTroLyAI" type="button" class="text-white hover:text-red-200 text-2xl leading-none px-1 cursor-pointer">&times;</button>
                </div>

                <div id="noiDungChatAI" class="flex-1 p-3 overflow-y-auto space-y-2.5 bg-slate-50 text-sm">
                    <div class="bg-blue-50 border border-blue-200 text-slate-700 p-2.5 rounded-xl text-xs leading-relaxed">
                        Xin chào! Tôi có thể đọc trực tiếp dữ liệu trên màn hình bạn đang mở (TKB, Sổ đầu bài, Thống kê, Chuyên cần...). Hãy đặt câu hỏi nhé!
                    </div>
                </div>

                <form id="formGuiCauHoiAI" class="p-2.5 bg-white border-t border-slate-200 flex gap-2">
                    <input id="inputCauHoiAI" type="text" placeholder="Nhập câu hỏi..." autocomplete="off"
                        class="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <button id="btnGuiAI" type="submit"
                        class="bg-[#0b5394] hover:bg-[#1e70b8] text-white font-bold px-3.5 py-1.5 rounded-lg text-sm cursor-pointer disabled:opacity-50">
                        Gửi
                    </button>
                </form>
            </div>
        `;
        document.body.appendChild(wrapper);

        const btnMo = document.getElementById('btnMoTroLyAI');
        const btnDong = document.getElementById('btnDongTroLyAI');
        const hopChat = document.getElementById('hopChatTroLyAI');
        const form = document.getElementById('formGuiCauHoiAI');
        const input = document.getElementById('inputCauHoiAI');
        const khungTin = document.getElementById('noiDungChatAI');

        btnMo.addEventListener('click', () => {
            btnMo.classList.add('hidden');
            hopChat.classList.remove('hidden');
            input.focus();
        });

        btnDong.addEventListener('click', () => {
            hopChat.classList.add('hidden');
            btnMo.classList.remove('hidden');
        });

        function themTinNhan(vaiTro, noiDung) {
            const div = document.createElement('div');
            div.className = vaiTro === 'user'
                ? 'ml-8 bg-[#0b5394] text-white p-2.5 rounded-xl text-xs whitespace-pre-wrap'
                : 'mr-4 bg-white border border-slate-200 text-slate-800 p-2.5 rounded-xl text-xs whitespace-pre-wrap shadow-sm';
            div.textContent = noiDung;
            khungTin.appendChild(div);
            khungTin.scrollTop = khungTin.scrollHeight;
            return div;
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cauHoi = input.value.trim();
            if (!cauHoi || dangTraLoi) return;

            if (typeof CAU_HINH_FRONTEND === 'undefined' || !CAU_HINH_FRONTEND.URL_API_MAY_CHU) {
                themTinNhan('assistant', 'Chưa tìm thấy đường dẫn máy chủ trong KetNoi.js.');
                return;
            }

            input.value = '';
            themTinNhan('user', cauHoi);
            const oTraLoi = themTinNhan('assistant', 'Đang đọc dữ liệu màn hình và phân tích...');
            dangTraLoi = true;
            document.getElementById('btnGuiAI').disabled = true;

            try {
                const phanHoi = await fetch(CAU_HINH_FRONTEND.URL_API_MAY_CHU, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({
                        thaoTac: 'hoiTroLyAI',
                        cauHoi: cauHoi,
                        nguCanh: layNguCanhTrangHienTai()
                    })
                });

                const ketQua = await phanHoi.json();
                if (ketQua.trangThai === 'thanh_cong') {
                    oTraLoi.textContent = ketQua.traLoi;
                } else {
                    oTraLoi.textContent = 'Lỗi: ' + (ketQua.thongBao || 'Không nhận được phản hồi.');
                }
            } catch (err) {
                oTraLoi.textContent = 'Lỗi kết nối: ' + (err.message || 'Vui lòng thử lại.');
            } finally {
                dangTraLoi = false;
                document.getElementById('btnGuiAI').disabled = false;
                khungTin.scrollTop = khungTin.scrollHeight;
                input.focus();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', taoGiaoDienTroLyAI);
})();
