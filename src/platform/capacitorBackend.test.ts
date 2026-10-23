import { capacitorBackend, capacitorFiles } from './capacitorBackend';

/** The phone's data directory, as the Filesystem plugin would see it: path → text. */
const disk = vi.hoisted(() => new Map<string, string>());
const native = vi.hoisted(() => ({ isNative: false }));

interface PathOptions {
  readonly path: string;
}
interface WriteOptions extends PathOptions {
  readonly data: string;
}
interface RenameOptions {
  readonly from: string;
  readonly to: string;
}

const missing = (path: string) => new Error(`File does not exist: ${path}`);

const fakeFilesystem = vi.hoisted(() => ({
  stat: vi.fn(({ path }: PathOptions) =>
    disk.has(path) ? Promise.resolve({ type: 'file' }) : Promise.reject(missing(path)),
  ),
  readFile: vi.fn(({ path }: PathOptions) => {
    const data = disk.get(path);
    return data === undefined ? Promise.reject(missing(path)) : Promise.resolve({ data });
  }),
  writeFile: vi.fn(({ path, data }: WriteOptions) => {
    disk.set(path, data);
    return Promise.resolve({ uri: path });
  }),
  deleteFile: vi.fn(({ path }: PathOptions) => {
    if (!disk.delete(path)) return Promise.reject(missing(path));
    return Promise.resolve();
  }),
  // Like iOS: a rename never overwrites, so the backend must clear the way first.
  rename: vi.fn(({ from, to }: RenameOptions) => {
    const data = disk.get(from);
    if (data === undefined) return Promise.reject(missing(from));
    if (disk.has(to)) return Promise.reject(new Error(`Already there: ${to}`));
    disk.delete(from);
    disk.set(to, data);
    return Promise.resolve();
  }),
}));

// The fake covers only the calls the backend makes, so it is cast to the plugin's type.
vi.mock(import('@capacitor/filesystem'), async (original) => {
  const plugin = await original();
  return { ...plugin, Filesystem: fakeFilesystem as unknown as typeof plugin.Filesystem };
});

vi.mock(import('@capacitor/core'), async (original) => {
  const core = await original();
  return {
    ...core,
    Capacitor: { ...core.Capacitor, isNativePlatform: () => native.isNative },
  };
});

beforeEach(() => {
  disk.clear();
  vi.clearAllMocks();
  native.isNative = false;
});

describe('the phone app’s files', () => {
  it('is offered only inside the native app', () => {
    expect(capacitorBackend.detect()).toBeNull();
    native.isNative = true;
    expect(capacitorBackend.detect()).toBe(capacitorFiles);
  });

  it('reads a slot never written as nothing', async () => {
    expect(await capacitorFiles.read('save')).toBeNull();
    expect(await capacitorFiles.read('prefs')).toBeNull();
  });

  it('keeps each slot as a UTF-8 file in the app’s data directory', async () => {
    await capacitorFiles.write('save', '{"day":1}');
    expect(disk.get('saves/save.json')).toBe('{"day":1}');
    expect(await capacitorFiles.read('save')).toBe('{"day":1}');
    expect(fakeFilesystem.writeFile).toHaveBeenCalledWith(
      expect.objectContaining({ directory: 'DATA', encoding: 'utf8', recursive: true }),
    );
  });

  it('writes through a temp file, never over the file in place', async () => {
    await capacitorFiles.write('prefs', 'first');
    await capacitorFiles.write('prefs', 'second');
    const written = fakeFilesystem.writeFile.mock.calls.map(([options]) => options.path);
    expect(written).toEqual(['saves/prefs.json.tmp', 'saves/prefs.json.tmp']);
    expect([...disk.keys()]).toEqual(['saves/prefs.json']);
    expect(await capacitorFiles.read('prefs')).toBe('second');
  });

  it('keeps one previous copy of the save, and only of the save', async () => {
    await capacitorFiles.write('save', 'one');
    await capacitorFiles.write('save', 'two');
    await capacitorFiles.write('save', 'three');
    expect(disk.get('saves/save.json')).toBe('three');
    expect(disk.get('saves/save.json.bak')).toBe('two');
    await capacitorFiles.write('edits', 'a');
    await capacitorFiles.write('edits', 'b');
    expect(disk.has('saves/edits.json.bak')).toBe(false);
  });

  it('reads a write cut off between its renames from the temp file', async () => {
    disk.set('saves/save.json.bak', 'old');
    disk.set('saves/save.json.tmp', 'new');
    expect(await capacitorFiles.read('save')).toBe('new');
  });

  it('keeps the old file when the new one could not be written', async () => {
    await capacitorFiles.write('save', 'safe');
    fakeFilesystem.writeFile.mockRejectedValueOnce(new Error('disk full'));
    await expect(capacitorFiles.write('save', 'lost')).rejects.toThrow('disk full');
    expect(await capacitorFiles.read('save')).toBe('safe');
  });

  it('reports a file that is there but will not read', async () => {
    disk.set('saves/save.json', 'unreadable');
    fakeFilesystem.readFile.mockRejectedValueOnce(new Error('permission denied'));
    await expect(capacitorFiles.read('save')).rejects.toThrow('permission denied');
  });

  it('empties a slot, keeping a removed save as the previous copy', async () => {
    await capacitorFiles.write('save', 'kept');
    await capacitorFiles.write('prefs', 'gone');
    await capacitorFiles.remove('save');
    await capacitorFiles.remove('prefs');
    await capacitorFiles.remove('edits');
    expect(await capacitorFiles.read('save')).toBeNull();
    expect(await capacitorFiles.read('prefs')).toBeNull();
    expect(disk.get('saves/save.json.bak')).toBe('kept');
  });
});
