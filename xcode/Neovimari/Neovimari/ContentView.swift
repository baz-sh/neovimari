import SafariServices
import SwiftUI

struct ContentView: View {
    @State private var extensionEnabled: Bool? = nil

    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "keyboard")
                .font(.system(size: 48))
                .foregroundStyle(.secondary)

            Text("Neovimari")
                .font(.largeTitle)
                .fontWeight(.bold)

            Text("Vim-style keyboard navigation for Safari")
                .foregroundStyle(.secondary)

            Divider()
                .padding(.horizontal, 40)

            if let enabled = extensionEnabled {
                HStack {
                    Image(systemName: enabled ? "checkmark.circle.fill" : "xmark.circle.fill")
                        .foregroundStyle(enabled ? .green : .red)
                    Text(enabled ? "Extension is enabled in Safari" : "Extension is not enabled")
                }
            }

            Button("Open Safari Extension Preferences") {
                SFSafariApplication.showPreferencesForExtension(
                    withIdentifier: "com.neovimari.Neovimari.Extension"
                ) { error in
                    if let error {
                        print("Error opening preferences: \(error)")
                    }
                }
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)

            Text("Enable Neovimari in Safari → Settings → Extensions")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding(40)
        .frame(width: 420, height: 340)
        .onAppear {
            checkExtensionState()
        }
    }

    private func checkExtensionState() {
        SFSafariExtensionManager.getStateOfSafariExtension(
            withIdentifier: "com.neovimari.Neovimari.Extension"
        ) { state, error in
            DispatchQueue.main.async {
                if let error {
                    print("Error checking extension state: \(error)")
                    extensionEnabled = false
                } else {
                    extensionEnabled = state?.isEnabled ?? false
                }
            }
        }
    }
}
