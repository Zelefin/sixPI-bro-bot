import { mockTelegramEnv, parseInitData, retrieveLaunchParams } from '@telegram-apps/sdk-react';

// It is important, to mock the environment only for development purposes. When building the
// application, import.meta.env.DEV will become false, and the code inside will be tree-shaken,
// so you will not see it in your final bundle.
if (import.meta.env.DEV) {
  let shouldMock: boolean;

  // Try to extract launch parameters to check if the current environment is Telegram-based.
  try {
    // If we are able to extract launch parameters, it means that we are already in the
    // Telegram environment. So, there is no need to mock it.
    retrieveLaunchParams();

    // We could previously mock the environment. In case we did, we should do it again. The reason
    // is the page could be reloaded, and we should apply mock again, because mocking also
    // enables modifying the window object.
    shouldMock = !!sessionStorage.getItem('____mocked');
  } catch (e) {
    shouldMock = true;
  }

  if (shouldMock) {
    const initDataRaw = new URLSearchParams([
      ['user', JSON.stringify({
        id: 99281932,
        first_name: 'Andrew',
        last_name: 'Rogue',
        username: 'rogue',
        language_code: 'en',
        is_premium: true,
        allows_write_to_pm: true,
      })],
      ['hash', '89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31'],
      ['auth_date', '1716922846'],
      ['start_param', 'debug'],
      ['chat_type', 'sender'],
      ['chat_instance', '8428209589180549439'],
    ]).toString();

    mockTelegramEnv({
      themeParams: {
        accentTextColor: '#3e88f7',
        bgColor: '#000000',
        buttonColor: '#3e88f7',
        buttonTextColor: '#ffffff',
        destructiveTextColor: '#eb5545',
        headerBgColor: '#1a1a1a',
        hintColor: '#98989e',
        linkColor: '#3e88f7',
        secondaryBgColor: '#1c1c1d',
        sectionBgColor: '#2c2c2e',
        sectionHeaderTextColor: '#8d8e93',
        sectionSeparatorColor: '#545458',
        subtitleTextColor: '#98989e',
        textColor: '#ffffff',
      },
      initData: parseInitData(initDataRaw),
      initDataRaw,
      version: '7.2',
      platform: 'tdesktop',
    });
    sessionStorage.setItem('____mocked', '1');

    console.info(
      'As long as the current environment was not considered as the Telegram-based one, it was mocked. Take a note, that you should not do it in production and current behavior is only specific to the development process. Environment mocking is also applied only in development mode. So, after building the application, you will not see this behavior and related warning, leading to crashing the application outside Telegram.',
    );
  }
}