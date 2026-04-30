module.exports = {
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
    navigate: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  })),
  Stack: {
    Protected: jest.fn(({ children }) => children),
  },
  usePathname: jest.fn(() => '/(tabs)/home'),
  Redirect: jest.fn(({ href }) => null),
};
