(() => {
  const form = document.querySelector(".apply-form");
  if (!form) return;

  const status = form.querySelector(".form-status");
  const dialog = document.querySelector("#successDialog");
  const closeDialogButton = document.querySelector("#closeDialog");
  const endpoint = form.dataset.endpoint;
  const loadingOverlay = document.querySelector("#loadingOverlay");

  const setStatus = (message, isError = false) => {
    if (!status) return;
    status.textContent = message;
    status.style.color = isError ? "#b91c1c" : "#0f4c81";
  };

  if (closeDialogButton && dialog) {
    closeDialogButton.addEventListener("click", () => dialog.close());
  }

  let isSubmitting = false;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const honeypot = form.querySelector('input[name="website"]');
    if (honeypot && honeypot.value.trim()) {
      setStatus("提交失败，请稍后再试。", true);
      return;
    }

    const nameValue = form.querySelector('input[name="name"]')?.value || "";
    if (nameValue.trim().length === 0 || nameValue.trim().length > 50) {
      setStatus("名字长度需在 1 到 50 字以内。", true);
      return;
    }

    const phoneValue = form.querySelector('input[name="phone"]')?.value || "";
    if (!/^01\d-?\d{8,9}$/.test(phoneValue.trim())) {
      setStatus("联系号码格式需为 01X-XXXXXXXX 或 01XXXXXXXXX。", true);
      return;
    }

    const regionValue = form.querySelector('select[name="region"]')?.value || "";
    if (!regionValue) {
      setStatus("请选择州属。", true);
      return;
    }

    const incomeValue = Number(
      form.querySelector('input[name="income"]')?.value || ""
    );
    if (Number.isNaN(incomeValue) || incomeValue < 0 || incomeValue > 1000000) {
      setStatus("每月净收入需在 0 到 1,000,000 之间。", true);
      return;
    }

    const amountValue = Number(
      form.querySelector('input[name="amount"]')?.value || ""
    );
    if (Number.isNaN(amountValue) || amountValue < 0 || amountValue > 10000000) {
      setStatus("贷款数额需在 0 到 10,000,000 之间。", true);
      return;
    }

    const turnstileToken = form.querySelector(
      'input[name="cf-turnstile-response"]'
    )?.value;
    if (!turnstileToken) {
      setStatus("请先完成人机验证。", true);
      return;
    }

    if (!endpoint || endpoint.includes("REPLACE_WITH_YOUR_ID")) {
      setStatus("请先配置表单接收地址。", true);
      return;
    }

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    const submitButton = form.querySelector('button[type="submit"]');

    try {
      isSubmitting = true;
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "提交中...";
      }
      if (loadingOverlay) {
        loadingOverlay.classList.add("is-active");
        loadingOverlay.setAttribute("aria-hidden", "false");
      }
      setStatus("提交中，请稍候...");
      const response = await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams(payload),
      });

      form.reset();
      if (response.type === "opaque" || response.ok) {
        setStatus("已提交成功，我们会尽快联系您。");
        if (dialog && typeof dialog.showModal === "function") {
          dialog.showModal();
        }
      } else {
        throw new Error("submit_failed");
      }
      if (window.turnstile) {
        window.turnstile.reset();
      }
    } catch (error) {
      setStatus("提交失败，请稍后再试。", true);
    } finally {
      isSubmitting = false;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "提交申请";
      }
      if (loadingOverlay) {
        loadingOverlay.classList.remove("is-active");
        loadingOverlay.setAttribute("aria-hidden", "true");
      }
    }
  });
})();
