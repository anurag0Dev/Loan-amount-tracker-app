(function () {
  'use strict';

  const STORAGE_KEY = 'loan-payment-tracker';
  const DATE_FMT = { day: '2-digit', month: '2-digit', year: 'numeric' };

  let payments = [];

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const el = {
    menuBtn: $('#menuBtn'),
    dropdown: $('#dropdown'),
    navAdd: $('#navAdd'),
    navAbout: $('#navAbout'),
    navDeleteAll: $('#navDeleteAll'),
    totalPaid: $('#totalPaid'),
    totalMonth: $('#totalMonth'),
    paymentList: $('#paymentList'),
    addSheet: $('#addSheet'),
    addSheetBackdrop: $('#addSheetBackdrop'),
    formAdd: $('#formAdd'),
    inputAmount: $('#inputAmount'),
    inputDate: $('#inputDate'),
    datePickerBtn: $('#datePickerBtn'),
    inputDateNative: $('#inputDateNative'),
    editSheet: $('#editSheet'),
    editSheetBackdrop: $('#editSheetBackdrop'),
    formEdit: $('#formEdit'),
    editId: $('#editId'),
    editAmount: $('#editAmount'),
    editDate: $('#editDate'),
    editDatePickerBtn: $('#editDatePickerBtn'),
    editDateNative: $('#editDateNative'),
    aboutModal: $('#aboutModal'),
    aboutModalBackdrop: $('#aboutModalBackdrop'),
    aboutModalClose: $('#aboutModalClose'),
    confirmModal: $('#confirmModal'),
    confirmModalBackdrop: $('#confirmModalBackdrop'),
    confirmMessage: $('#confirmMessage'),
    confirmCancel: $('#confirmCancel'),
    confirmOk: $('#confirmOk'),
  };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      payments = raw ? JSON.parse(raw) : [];
    } catch (_) {
      payments = [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
    } catch (_) {}
  }

  function parseLocalDate(ymdStr) {
    if (!ymdStr || String(ymdStr).length < 10) return null;
    const s = String(ymdStr).trim().slice(0, 10);
    const parts = s.split(/[-/]/);
    if (parts.length !== 3) return null;
    const n0 = parseInt(parts[0], 10);
    const n1 = parseInt(parts[1], 10);
    const n2 = parseInt(parts[2], 10);
    if (isNaN(n0) || isNaN(n1) || isNaN(n2)) return null;
    if (parts[0].length === 4) {
      return new Date(n0, n1 - 1, n2);
    }
    return new Date(n2, n1 - 1, n0);
  }

  function formatDate(str) {
    if (!str) return '';
    const d = parseLocalDate(str);
    if (!d || isNaN(d.getTime())) return str;
    return d.toLocaleDateString('en-GB', DATE_FMT);
  }

  function formatDisplayDate(str) {
    return formatDate(str);
  }

  function toYMD(date) {
    if (!date || isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function getTodayYMD() {
    return toYMD(new Date());
  }

  function nextId() {
    const ids = payments.map((p) => p.id).filter(Number.isFinite);
    return ids.length ? Math.max(...ids) + 1 : 1;
  }

  function getTotals() {
    const totalAmount = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    return { totalAmount, totalMonths: payments.length };
  }

  function renderSummary() {
    const { totalAmount, totalMonths } = getTotals();
    el.totalPaid.textContent = String(totalAmount);
    el.totalMonth.textContent = String(totalMonths);
  }

  function openAddSheet() {
    el.formAdd.reset();
    const today = getTodayYMD();
    el.inputDateNative.value = today;
    el.inputDate.value = formatDisplayDate(today);
    el.addSheet.setAttribute('aria-hidden', 'false');
    el.addSheet.classList.add('is-open');
    el.inputAmount.focus();
  }

  function closeAddSheet() {
    el.addSheet.classList.remove('is-open');
    el.addSheet.setAttribute('aria-hidden', 'true');
  }

  function openEditSheet(payment) {
    el.editId.value = String(payment.id);
    el.editAmount.value = String(payment.amount ?? '');
    el.editDate.value = formatDisplayDate(payment.date);
    el.editDateNative.value = payment.date ? payment.date.slice(0, 10) : '';
    el.editSheet.setAttribute('aria-hidden', 'false');
    el.editSheet.classList.add('is-open');
    el.editAmount.focus();
  }

  function closeEditSheet() {
    el.editSheet.classList.remove('is-open');
    el.editSheet.setAttribute('aria-hidden', 'true');
  }

  function openAbout() {
    el.aboutModal.setAttribute('aria-hidden', 'false');
    el.aboutModal.classList.add('is-open');
  }

  function closeAbout() {
    el.aboutModal.classList.remove('is-open');
    el.aboutModal.setAttribute('aria-hidden', 'true');
  }

  function confirm(message, onOk) {
    el.confirmMessage.textContent = message;
    el.confirmModal.setAttribute('aria-hidden', 'false');
    el.confirmModal.classList.add('is-open');
    el.confirmOk.onclick = function () {
      closeConfirm();
      if (onOk) onOk();
    };
  }

  function closeConfirm() {
    el.confirmModal.classList.remove('is-open');
    el.confirmModal.setAttribute('aria-hidden', 'true');
    el.confirmOk.onclick = null;
  }

  function syncDateToDisplay(nativeInput, displayInput) {
    const val = nativeInput.value;
    if (!val) {
      displayInput.value = '';
      return;
    }
    const d = parseLocalDate(val);
    displayInput.value = d ? formatDisplayDate(toYMD(d)) : val;
  }

  function addPayment(amount, date) {
    const id = nextId();
    payments.push({
      id,
      amount: Number(amount) || 0,
      date: date ? date.slice(0, 10) : '',
    });
    save();
    render();
  }

  function updatePayment(id, amount, date) {
    const p = payments.find((x) => x.id === Number(id));
    if (!p) return;
    p.amount = Number(amount) || 0;
    p.date = date ? date.slice(0, 10) : '';
    save();
    render();
  }

  function deletePayment(id) {
    payments = payments.filter((p) => p.id !== Number(id));
    save();
    render();
  }

  function clearAll() {
    payments = [];
    save();
    render();
  }

  function render() {
    renderSummary();
    if (payments.length === 0) {
      el.paymentList.innerHTML = '<li class="payment-list-empty">No payments yet. Use Add from the menu.</li>';
      return;
    }
    el.paymentList.innerHTML = payments
      .map((p, i) => {
        const editSvg =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
        const delSvg =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/><path d="M10 11v6M14 11v6"/></svg>';
        return `
        <li class="payment-card" data-id="${p.id}">
          <span class="index">${i + 1}.</span>
          <span class="amount">${p.amount}</span>
          <span class="date">${formatDisplayDate(p.date)}</span>
          <button type="button" class="btn-edit" data-id="${p.id}" data-action="edit" aria-label="Edit">${editSvg}</button>
          <button type="button" class="btn-delete" data-id="${p.id}" data-action="delete" aria-label="Delete">${delSvg}</button>
        </li>`;
      })
      .join('');

    el.paymentList.querySelectorAll('[data-action="edit"]').forEach((btn) => {
      btn.addEventListener('click', function () {
        const p = payments.find((x) => x.id === Number(this.dataset.id));
        if (p) openEditSheet(p);
      });
    });
    el.paymentList.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener('click', function () {
        const id = this.dataset.id;
        confirm('Delete this payment?', () => deletePayment(id));
      });
    });
  }

  function closeDropdown() {
    el.dropdown.classList.remove('is-open');
    el.dropdown.setAttribute('aria-hidden', 'true');
  }

  el.menuBtn.addEventListener('click', function () {
    const open = el.dropdown.classList.toggle('is-open');
    el.dropdown.setAttribute('aria-hidden', String(!open));
  });

  el.navAdd.addEventListener('click', function () {
    closeDropdown();
    openAddSheet();
  });

  el.navAbout.addEventListener('click', function () {
    closeDropdown();
    openAbout();
  });

  el.navDeleteAll.addEventListener('click', function () {
    closeDropdown();
    if (payments.length === 0) return;
    confirm('Delete all payments? This cannot be undone.', () => {
      clearAll();
    });
  });

  document.addEventListener('click', function (e) {
    if (!el.dropdown.contains(e.target) && !el.menuBtn.contains(e.target)) {
      closeDropdown();
    }
  });

  el.addSheetBackdrop.addEventListener('click', closeAddSheet);
  el.editSheetBackdrop.addEventListener('click', closeEditSheet);
  el.aboutModalBackdrop.addEventListener('click', closeAbout);
  el.confirmModalBackdrop.addEventListener('click', closeConfirm);

  el.formAdd.addEventListener('submit', function (e) {
    e.preventDefault();
    const amount = el.inputAmount.value.trim();
    const date = el.inputDateNative.value || el.inputDate.value.trim();
    if (!amount) return;
    let dateStr = '';
    if (date) {
      const d = parseLocalDate(date);
      if (d && !isNaN(d.getTime())) dateStr = toYMD(d);
      else if (/^\d{4}-\d{2}-\d{2}$/.test(date.slice(0, 10))) dateStr = date.slice(0, 10);
    }
    addPayment(amount, dateStr);
    closeAddSheet();
  });

  function openDatePicker(input, displayInput) {
    if (!input.value && displayInput) {
      const today = getTodayYMD();
      input.value = today;
      displayInput.value = formatDisplayDate(today);
    }
    if (input.showPicker) input.showPicker();
    else input.click();
  }
  el.datePickerBtn.addEventListener('click', function (e) {
    e.preventDefault();
    openDatePicker(el.inputDateNative, el.inputDate);
  });
  el.inputDate.addEventListener('click', function (e) {
    e.preventDefault();
    openDatePicker(el.inputDateNative, el.inputDate);
  });
  el.inputDateNative.addEventListener('focus', function () {
    openDatePicker(this, el.inputDate);
  });
  el.inputDateNative.addEventListener('change', function () {
    syncDateToDisplay(el.inputDateNative, el.inputDate);
  });

  el.formEdit.addEventListener('submit', function (e) {
    e.preventDefault();
    const id = el.editId.value;
    const amount = el.editAmount.value.trim();
    const date = el.editDateNative.value || el.editDate.value.trim();
    let dateStr = '';
    if (date) {
      const d = parseLocalDate(date);
      if (d && !isNaN(d.getTime())) dateStr = toYMD(d);
      else if (/^\d{4}-\d{2}-\d{2}$/.test(date.slice(0, 10))) dateStr = date.slice(0, 10);
    }
    updatePayment(id, amount, dateStr);
    closeEditSheet();
  });

  el.editDatePickerBtn.addEventListener('click', function (e) {
    e.preventDefault();
    openDatePicker(el.editDateNative, el.editDate);
  });
  el.editDate.addEventListener('click', function (e) {
    e.preventDefault();
    openDatePicker(el.editDateNative, el.editDate);
  });
  el.editDateNative.addEventListener('focus', function () {
    openDatePicker(this, el.editDate);
  });
  el.editDateNative.addEventListener('change', function () {
    syncDateToDisplay(el.editDateNative, el.editDate);
  });

  el.aboutModalClose.addEventListener('click', closeAbout);
  el.confirmCancel.addEventListener('click', closeConfirm);

  load();
  render();
})();
