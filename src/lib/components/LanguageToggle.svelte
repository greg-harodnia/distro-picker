<script lang="ts">
  import { locale, availableLanguages, t } from '$lib/i18n/locale';
  import { onMount } from 'svelte';

  onMount(() => {
    locale.init();
  });

  function toggleLanguage() {
    locale.toggle();
  }

  $: currentLang = availableLanguages.find(l => l.code === $locale) || availableLanguages[0];
  $: nextLang = availableLanguages.find(l => l.code !== $locale) || availableLanguages[1];
</script>

<button
  type="button"
  class="language-toggle"
  on:click={toggleLanguage}
  aria-label={$t('language.toggle')}
  title={$t('language.toggle')}
>
  <span class="lang-code">{nextLang.code.toUpperCase()}</span>
</button>

<style>
  .language-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: none;
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    cursor: pointer;
    transition: var(--transition-normal);
    box-shadow: var(--shadow-sm);
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
  }

  .language-toggle:hover {
    background: var(--color-background-secondary);
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }

  .language-toggle:active {
    transform: translateY(0);
  }

  .lang-code {
    font-size: var(--text-sm);
  }
</style>
