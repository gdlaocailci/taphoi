(function () {
    let dangTraLoi = false;

    // 1. Trích xuất dữ liệu từ màn hình đang mở (TKB hoặc Sổ đầu bài)
    function layNguCanhTrangHienTai() {
        const khungTKB = document.getElementById('khungTKB');
        const khungSDB = document.getElementById('khungSoDauBai');

        if (khungTKB && !khungTKB.classList.contains('hidden')) {
            const tuan = document.getElementById('hienThiTuanHienTai')?.value || '';
            const dong = Array.from(document.querySelectorAll('#vungHienThiDuLieu tr'));
            const thongKeGV = {};

            dong.forEach(tr => {
                const inputs = Array.from(tr.querySelectorAll('input'));
                if (inputs.length >= 2) {
                    for (let i = 1; i < inputs.length; i += 2) {
                        const tenGV = (inputs[i]?.value || '').trim();
                        const tenMon = (inputs[i - 1]?.value || '').trim();
                        if (tenGV && tenGV !== '--' && tenMon && tenMon !== '--') {
                            thongKeGV[tenGV] = (thongKeGV[tenGV] || 0) + 1;
                        }
                    }
                } else {
                    const cells = Array.from(tr.querySelectorAll('td')).filter(td => !td.style.left);
                    for (let i = 1; i < cells.length; i += 2) {
                        const tenGV = (cells[i]?.innerText || '').trim();
                        const tenMon = (cells[i - 1]?.innerText || '').trim();
                        if (tenGV && tenGV !== '--' && tenMon && tenMon !== '--') {
                            thongKeGV[tenGV] = (thongKeGV[tenGV] || 0) + 1;
                        }
                    }
                }
            });

            const danhSachRutGon = Object.entries(thongKeGV)
                .map(([gv, soTiet]) => `${gv}: ${soTiet} tiết`)
                .join('\n');

            if (danhSachRutGon) {
                return `Ngữ cảnh: Tổng hợp số tiết trên lưới TKB Tuần ${tuan}:\n${danhSachRutGon.slice(0, 6000)}`;
            }
            return `Ngữ cảnh: Lưới TKB Tuần ${tuan} hiện chưa có dữ liệu tiết dạy.`;
        }

        if (khungSDB && !khungSDB.classList.contains('hidden')) {
            const lop = document.getElementById('chonLopSo')?.value || '';
            const tuan = document.getElementById('chonTuanSo')?.value || '';
            const vanBan = (document.getElementById('vungHienThiSoDauBai')?.innerText || '').slice(0, 5000);
            return `Ngữ cảnh: Sổ đầu bài lớp ${lop}, tuần ${tuan}.\n${vanBan}`;
        }

        return 'Ngữ cảnh: Hệ thống Quản lý Chương trình Dạy - Học.';
    }

    // 2. Dựng nút bấm và hộp thoại chat AI
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
                        <div class="text-[11px] text-blue-200">Kết nối bảo mật qua hệ thống trường</div>
                    </div>
                    <button id="btnDongTroLyAI" type="button" class="text-white hover:text-red-200 text-2xl leading-none px-1 cursor-pointer">&times;</button>
                </div>

                <div id="noiDungChatAI" class="flex-1 p-3 overflow-y-auto space-y-2.5 bg-slate-50 text-sm">
                    <div class="bg-blue-50 border border-blue-200 text-slate-700 p-2.5 rounded-xl text-xs leading-relaxed">
                        Xin chào! Tôi có thể giúp bạn tổng hợp số tiết trên lưới TKB, kiểm tra lịch dạy hoặc đọc nội dung Sổ đầu bài đang mở.
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
            const oTraLoi = themTinNhan('assistant', 'Đang phân tích dữ liệu...');
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
