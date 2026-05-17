<script lang="ts" setup></script>

<template>
  <footer class="app-footer">
    <div class="app-footer__card">
      <section class="app-footer__promo">
        <div class="app-footer__grid"></div>

        <span class="app-footer__label app-footer__label--left">
          Сохрани<br />
          рецепт
        </span>

        <a href="/recipes" class="app-footer__cta"> Найти рецепт </a>

        <span class="app-footer__label app-footer__label--right"> Вкусно! </span>
      </section>

      <section class="app-footer__bottom">
        <p class="app-footer__text">
          Домашние рецепты, идеи для ужина и маленькие кулинарные находки на каждый день.
        </p>

        <div class="app-footer__row">
          <a href="/" class="app-footer__brand" aria-label="Мои рецепты">
            <span>Мои рецепты</span>
            <span class="app-footer__mascot">🥘</span>
          </a>

          <nav class="app-footer__socials" aria-label="Социальные сети">
            <a href="#" class="app-footer__social">X</a>
            <a href="#" class="app-footer__social">◎</a>
          </nav>
        </div>
      </section>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.app-footer {
  --footer-shell: #f3e4e7;
  --footer-card: #fffaf5;
  --footer-promo: #f7cfd8;
  --footer-text: #122035;
  --footer-cta: #f6d36b;
  --footer-mint: #74c7b8;
  --footer-coral: #e96f67;
  --footer-grid: rgba(18, 32, 53, 0.35);

  width: 100%;
  padding: 0;
  background-color: transparent;
  border-radius: 14px;
}

/* Dark theme */
:global(.dark) .app-footer,
:global(.theme-dark) .app-footer,
:global([data-theme="dark"]) .app-footer {
  --footer-shell: #0f0c0a;
  --footer-card: #18120f;
  --footer-promo: #8f3f34;
  --footer-text: #fff3df;
  --footer-cta: #ffd35a;
  --footer-mint: #79d8c4;
  --footer-coral: #ef6f61;
  --footer-grid: rgba(255, 243, 223, 0.2);
}

.app-footer__card {
  margin: 16px;
  overflow: hidden;
  border-radius: 14px;
  background-color: var(--footer-card);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
}

.app-footer__promo {
  position: relative;
  min-height: 150px;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 30px 18px;

  background-color: var(--footer-promo);
  border-bottom: 2px solid var(--footer-text);
}

.app-footer__promo::before,
.app-footer__promo::after {
  content: "";
  position: absolute;
  left: 0;
  z-index: 2;

  width: 100%;
  height: 18px;

  background-size: 28px 18px;
  background-repeat: repeat-x;
  pointer-events: none;
}

.app-footer__promo::before {
  top: 0;
  background-image: radial-gradient(
    circle at 14px -2px,
    var(--footer-card) 0 11px,
    transparent 12px
  );
}

.app-footer__promo::after {
  bottom: 0;
  background-image: radial-gradient(
    circle at 14px 20px,
    var(--footer-card) 0 11px,
    transparent 12px
  );
}

.app-footer__grid {
  position: absolute;
  inset: 0;
  z-index: 1;

  background-image:
    linear-gradient(var(--footer-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--footer-grid) 1px, transparent 1px);
  background-size:
    100% 58px,
    62px 100%;
}

.app-footer__cta {
  position: relative;
  z-index: 3;

  min-width: 174px;
  padding: 16px 24px;

  border: 3px solid var(--footer-text);
  border-radius: 999px;

  background-color: var(--footer-cta);
  color: #14110f;

  font-size: 20px;
  font-weight: 900;
  line-height: 1;
  text-align: center;
  text-decoration: underline;
  text-underline-offset: 5px;

  box-shadow: 0 8px 0 var(--footer-text);
  transform: rotate(-1deg);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.app-footer__cta:hover {
  transform: translateY(3px) rotate(-1deg);
  box-shadow: 0 5px 0 var(--footer-text);
}

.app-footer__cta:focus-visible,
.app-footer__social:focus-visible,
.app-footer__brand:focus-visible {
  outline: 2px solid var(--footer-cta);
  outline-offset: 3px;
}

.app-footer__label {
  position: absolute;
  z-index: 3;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 70px;
  min-height: 46px;
  padding: 8px 10px;

  border: 2px solid var(--footer-text);

  color: #14110f;
  font-size: 11px;
  font-weight: 900;
  line-height: 1.1;
  text-align: center;
  text-transform: uppercase;
}

.app-footer__label--left {
  left: 28px;
  top: 44px;

  background-color: var(--footer-mint);
  transform: rotate(-8deg);
}

.app-footer__label--right {
  right: 24px;
  top: 48px;

  width: 66px;
  height: 66px;

  border-radius: 50%;
  background-color: #2f7ed8;
  color: #fff;
  transform: rotate(-10deg);
}

:global(.dark) .app-footer__label--right,
:global(.theme-dark) .app-footer__label--right,
:global([data-theme="dark"]) .app-footer__label--right {
  background-color: var(--footer-coral);
  color: #fff3df;
}

.app-footer__bottom {
  padding: 26px 28px 22px;
}

.app-footer__text {
  max-width: 520px;
  margin: 0 auto 22px;

  color: var(--footer-text);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.35;
  text-align: center;
}

.app-footer__row {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
}

.app-footer__brand {
  display: inline-flex;
  align-items: end;
  gap: 10px;

  color: var(--footer-text);
  font-size: clamp(34px, 7vw, 64px);
  font-weight: 950;
  line-height: 0.9;
  letter-spacing: -0.06em;
  text-decoration: none;
}

.app-footer__mascot {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 38px;
  height: 38px;

  font-size: 28px;
  letter-spacing: 0;
}

.app-footer__socials {
  display: flex;
  align-items: center;
  gap: 14px;
}

.app-footer__social {
  color: var(--footer-text);
  font-size: 20px;
  font-weight: 900;
  line-height: 1;
  text-decoration: none;
}

.app-footer__social:hover {
  opacity: 0.65;
}

@media (max-width: 640px) {
  .app-footer {
    padding: 10px;
  }

  .app-footer__promo {
    min-height: 150px;
    padding: 28px 12px;
  }

  .app-footer__cta {
    min-width: 160px;
    padding: 15px 22px;
    font-size: 18px;
  }

  .app-footer__label {
    min-width: 62px;
    min-height: 42px;
    font-size: 10px;
  }

  .app-footer__label--left {
    left: 18px;
    top: 38px;
  }

  .app-footer__label--right {
    right: 18px;
    top: 42px;

    width: 58px;
    height: 58px;
  }

  .app-footer__bottom {
    padding: 22px 18px 18px;
  }

  .app-footer__row {
    align-items: center;
  }

  .app-footer__brand {
    font-size: 36px;
  }

  .app-footer__mascot {
    width: 30px;
    height: 30px;
    font-size: 22px;
  }
}
</style>
