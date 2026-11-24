(function () {
    let phienAI = null;
    let dangTraLoi = false;

    // 1. Kiểm tra khả năng chạy Gemini Nano cục bộ trên Chrome
    async function kiemTraHoTroGeminiNano() {
        if (!('LanguageModel' in window)) return { sanSang: false };
        try {
            const trangThai = await LanguageModel.availability();
            if (trangThai === 'unavailable') return { sanSang: false };
            return { sanSang: true, trangThai };
        } catch (e) {
            return { sanSang: false };
        }
    }

    // 2. Rút gọn dữ liệu từ màn hình đang mở để Gemini Nano đọc nhanh, không tràn bộ nhớ
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
                return `Ngữ cảnh: Tổng hợp số tiết trên lưới TKB Tuần ${tuan}:\n${danhSachRutGon.slice(0, 2500)}`;
            }
            return `Ngữ cảnh: Lưới TKB Tuần ${tuan} hiện chưa có dữ liệu tiết dạy.`;
        }

        if (khungSDB && !khungSDB.classList.contains('hidden')) {
            const lop = document.getElementById('chonLopSo')?.value || '';
            const tuan = document.getElementById('chonTuanSo')?.value || '';
            const vanBan = (document.getElementById('vungHienThiSoDauBai')?.innerText || '').slice(0, 2200);
            return `Ngữ cảnh: Sổ đầu bài lớp ${lop}, tuần ${tuan}.\n${vanBan}`;
        }

        return 'Ngữ cảnh: Hệ thống Quản lý Chương trình Dạy - Học.';
    }

    // 3. Dựng nút bấm và hộp thoại chat AI bằng Tailwind CSS
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
                <span class="text-sm">Hỏi Gemini Nano</span>
            </button>

            <div id="hopChatTroLyAI" class="hidden w-[360px] max-w-[92vw] h-[480px] bg-white border border-slate-300 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <div class="bg-[#0b5394] text-white px-4 py-3 flex items-center justify-between">
                    <div>
                        <div class="font-bold text-sm">Trợ lý Gemini (Chrome Cục bộ)</div>
                        <div id="trangThaiModelAI" class="text-[11px] text-blue-200">Chạy trực tiếp trên máy, không cần API</div>
                    </div>
                    <button id="btnDongTroLyAI" type="button" class="text-white hover:text-red-200 text-2xl leading-none px-1 cursor-pointer">&times;</button>
                </div>

                <div id="noiDungChatAI" class="flex-1 p-3 overflow-y-auto space-y-2.5 bg-slate-50 text-sm">
                    <div class="bg-blue-50 border border-blue-200 text-slate-700 p-2.5 rounded-xl text-xs leading-relaxed">
                        Xin chào! Tôi chạy trực tiếp trên trình duyệt Chrome của bạn. Bạn có thể hỏi về lịch dạy tuần này, số tiết hoặc nội dung sổ đầu bài đang mở.
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
        const nhanTrangThai = document.getElementById('trangThaiModelAI');

        btnMo.addEventListener('click', () => {
            btnMo.classList.add('hidden');
            hopChat.classList.remove('hidden');
            input.focus();
        });

        btnDong.addEventListener('click', () => {
            hopChat.classList.add('hidden');
            btnMo.classList.remove('hidden');
            if (phienAI && !dangTraLoi) {
                phienAI.destroy();
                phienAI = null;
            }
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

            input.value = '';
            themTinNhan('user', cauHoi);
            const oTraLoi = themTinNhan('assistant', 'Đang khởi tạo Gemini Nano...');
            dangTraLoi = true;
            document.getElementById('btnGuiAI').disabled = true;

            try {
                if (!phienAI) {
                    const trangThai = await LanguageModel.availability();
                    if (trangThai === 'downloading' || trangThai === 'downloadable') {
                        oTraLoi.textContent = 'Chrome đang tải mô hình Gemini Nano (~1,5–4GB) lần đầu. Bạn có thể mở chrome://components để xem tiến trình...';
                    }

                    phienAI = await LanguageModel.create({
                        initialPrompts: [{
                            role: 'system',
                            content: 'Bạn là trợ lý chuyên môn trường học. Trả lời ngắn gọn, chính xác bằng tiếng Việt dựa trên dữ liệu được cung cấp.'
                        }],
                        monitor(m) {
                            m.addEventListener('downloadprogress', (ev) => {
                                const pt = Math.round(ev.loaded * 100);
                                nhanTrangThai.textContent = `Đang tải mô hình cục bộ: ${pt}%`;
                                oTraLoi.textContent = `Đang tải Gemini Nano lần đầu (${pt}%)...`;
                            });
                        }
                    });
                    nhanTrangThai.textContent = 'Gemini Nano đã sẵn sàng (Offline/Local)';
                }

                oTraLoi.textContent = 'Đã nạp xong mô hình, đang phân tích dữ liệu...';

                const nguCanh = layNguCanhTrangHienTai();
                const promptDayDu = `${nguCanh}\n\nYêu cầu của giáo viên: ${cauHoi}`;
                const stream = phienAI.promptStreaming(promptDayDu);

                let ketQua = '';
                let daNhanChuDau = false;
                for await (const chunk of stream) {
                    if (!daNhanChuDau) {
                        oTraLoi.textContent = '';
                        daNhanChuDau = true;
                    }
                    ketQua += chunk;
                    oTraLoi.textContent = ketQua;
                    khungTin.scrollTop = khungTin.scrollHeight;
                }
            } catch (err) {
                oTraLoi.textContent = 'Không thể xử lý: ' + (err.message || 'Lỗi mô hình cục bộ.');
            } finally {
                dangTraLoi = false;
                document.getElementById('btnGuiAI').disabled = false;
                input.focus();
            }
        });
    }

    // 4. Tự động khởi chạy sau khi trang tải xong
    document.addEventListener('DOMContentLoaded', async () => {
        const kq = await kiemTraHoTroGeminiNano();
        if (kq.sanSang) {
            taoGiaoDienTroLyAI();
        }
    });
})();
