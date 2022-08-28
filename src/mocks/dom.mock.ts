const scrollIntoViewMock = jest.fn();
window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

export { scrollIntoViewMock };
